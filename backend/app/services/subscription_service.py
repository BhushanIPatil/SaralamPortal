from datetime import date, datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import razorpay
from app.models.user import User
from app.models.job import Job
from app.models.application import JobApplication
from app.models.subscription import (
    SubscriptionPlan,
    SubscriptionOffer,
    UserSubscription,
    Payment,
)
from app.core.config import settings

# Free tier limits
FREE_JOBS_PER_MONTH = 2
FREE_APPLICATIONS_PER_MONTH = 3
UPGRADE_URL = "/pricing"


class SubscriptionService:
    async def check_feature(
        self, db: AsyncSession, user_id: UUID, feature: str
    ) -> tuple[bool, str | None]:
        """
        Returns (allowed, upgrade_url).
        If allowed is True, upgrade_url is irrelevant. If False, upgrade_url for 402 response.
        """
        if feature == "job_posting":
            return await self._check_job_posting(db, user_id)
        if feature == "application":
            return await self._check_application(db, user_id)
        if feature == "view_contact":
            return await self._check_view_contact(db, user_id)
        if feature == "premium_jobs":
            return await self._check_premium_jobs(db, user_id)
        return True, None

    async def _check_job_posting(self, db: AsyncSession, user_id: UUID) -> tuple[bool, str | None]:
        active = await self._get_active_subscription(db, user_id)
        if active and active.plan.max_job_postings_per_month == -1:
            return True, None
        limit = (
            active.plan.max_job_postings_per_month
            if active and active.plan.max_job_postings_per_month >= 0
            else FREE_JOBS_PER_MONTH
        )
        start = date.today().replace(day=1)
        result = await db.execute(
            select(func.count(Job.id)).where(
                and_(
                    Job.seeker_id == user_id,
                    func.cast(Job.created_at, type_=date) >= start,
                    Job.is_active == True,
                )
            )
        )
        count = result.scalar() or 0
        if count >= limit:
            return False, UPGRADE_URL
        return True, None

    async def _check_application(self, db: AsyncSession, user_id: UUID) -> tuple[bool, str | None]:
        active = await self._get_active_subscription(db, user_id)
        if active and active.plan.max_applications_per_month == -1:
            return True, None
        limit = (
            active.plan.max_applications_per_month
            if active and active.plan.max_applications_per_month >= 0
            else FREE_APPLICATIONS_PER_MONTH
        )
        start = date.today().replace(day=1)
        result = await db.execute(
            select(func.count(JobApplication.id)).where(
                and_(
                    JobApplication.applicant_id == user_id,
                    func.cast(JobApplication.applied_at, type_=date) >= start,
                )
            )
        )
        count = result.scalar() or 0
        if count >= limit:
            return False, UPGRADE_URL
        return True, None

    async def _check_view_contact(self, db: AsyncSession, user_id: UUID) -> tuple[bool, str | None]:
        active = await self._get_active_subscription(db, user_id)
        if active and active.plan.can_view_contact_info:
            return True, None
        return False, UPGRADE_URL

    async def _check_premium_jobs(self, db: AsyncSession, user_id: UUID) -> tuple[bool, str | None]:
        active = await self._get_active_subscription(db, user_id)
        if active and active.plan.can_see_premium_jobs:
            return True, None
        return False, UPGRADE_URL

    async def _get_active_subscription(
        self, db: AsyncSession, user_id: UUID
    ) -> UserSubscription | None:
        result = await db.execute(
            select(UserSubscription)
            .options(selectinload(UserSubscription.plan))
            .where(
                UserSubscription.user_id == user_id,
                UserSubscription.status == "active",
                UserSubscription.end_date >= date.today(),
                UserSubscription.is_active == True,
            )
            .order_by(UserSubscription.end_date.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()


    async def get_plans_with_offers(self, db: AsyncSession) -> list[SubscriptionPlan]:
        result = await db.execute(
            select(SubscriptionPlan)
            .where(SubscriptionPlan.is_active == True)
            .options(selectinload(SubscriptionPlan.offers))
            .order_by(SubscriptionPlan.sort_order, SubscriptionPlan.name)
        )
        return list(result.scalars().all())

    async def create_order(
        self, db: AsyncSession, user_id: UUID, plan_id: UUID, offer_code: str | None = None
    ) -> tuple[str, float, str, str]:
        plan_result = await db.execute(
            select(SubscriptionPlan).where(
                SubscriptionPlan.id == plan_id, SubscriptionPlan.is_active == True
            )
        )
        plan = plan_result.scalar_one_or_none()
        if not plan:
            raise ValueError("Plan not found")
        amount = plan.price
        offer_id = None
        if offer_code:
            offer_result = await db.execute(
                select(SubscriptionOffer).where(
                    SubscriptionOffer.offer_code == offer_code,
                    SubscriptionOffer.plan_id == plan_id,
                    SubscriptionOffer.is_active == True,
                )
            )
            offer = offer_result.scalar_one_or_none()
            if offer and offer.discount_value:
                if offer.discount_type == "percent":
                    amount = plan.price * (1 - offer.discount_value / 100)
                elif offer.discount_type == "flat":
                    amount = max(0, plan.price - offer.discount_value)
                elif offer.discount_type == "free":
                    amount = 0
                offer_id = offer.id
        amount_paise = int(amount * 100)
        if amount_paise < 1:
            amount_paise = 1
        client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
        order = client.order.create(
            {"amount": amount_paise, "currency": plan.currency, "payment_capture": 1}
        )
        order_id = order["id"]
        sub = UserSubscription(
            user_id=user_id,
            plan_id=plan_id,
            offer_id=offer_id,
            start_date=date.today(),
            end_date=date.today(),  # will set on verify
            status="trial",
            razorpay_order_id=order_id,
            amount_paid=amount if amount_paise else None,
            currency=plan.currency,
        )
        db.add(sub)
        await db.flush()
        pay = Payment(
            user_id=user_id,
            subscription_id=sub.id,
            razorpay_order_id=order_id,
            amount=amount,
            currency=plan.currency,
            status="pending",
        )
        db.add(pay)
        await db.flush()
        return order_id, amount, plan.currency, str(sub.id)

    def verify_payment_signature(
        self, order_id: str, payment_id: str, signature: str
    ) -> bool:
        client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
            return True
        except Exception:
            return False

    async def activate_subscription(
        self, db: AsyncSession, order_id: str, user_id: UUID
    ) -> UserSubscription | None:
        result = await db.execute(
            select(UserSubscription).where(
                UserSubscription.razorpay_order_id == order_id,
                UserSubscription.user_id == user_id,
            ).options(selectinload(UserSubscription.plan))
        )
        sub = result.scalar_one_or_none()
        if not sub or not sub.plan:
            return None
        sub.start_date = date.today()
        sub.end_date = date.today() + timedelta(days=sub.plan.duration_days)
        sub.status = "active"
        pay_result = await db.execute(
            select(Payment).where(Payment.razorpay_order_id == order_id)
        )
        for p in pay_result.scalars().all():
            p.status = "success"
        await db.flush()
        await db.refresh(sub)
        return sub

    async def get_my_subscription(
        self, db: AsyncSession, user_id: UUID
    ) -> UserSubscription | None:
        return await self._get_active_subscription(db, user_id)

    async def cancel_auto_renew(self, db: AsyncSession, user_id: UUID) -> bool:
        sub = await self._get_active_subscription(db, user_id)
        if not sub:
            return False
        sub.auto_renew = False
        await db.flush()
        return True


subscription_service = SubscriptionService()
