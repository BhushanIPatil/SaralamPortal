from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_active_user
from app.schemas.base import ApiResponse
from app.schemas.subscription import (
    PlanResponse,
    PlanWithOffersResponse,
    OfferResponse,
    SubscribeRequest,
    SubscribeResponse,
    VerifyPaymentRequest,
    MySubscriptionResponse,
)
from app.services.subscription_service import subscription_service
from app.models.user import User

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=ApiResponse[list[PlanWithOffersResponse]])
async def list_plans(db: AsyncSession = Depends(get_db)):
    plans = await subscription_service.get_plans_with_offers(db)
    out = []
    for p in plans:
        out.append(PlanWithOffersResponse(
            **PlanResponse.model_validate(p).model_dump(),
            offers=[OfferResponse.model_validate(o) for o in (p.offers or [])],
        ))
    return ApiResponse(data=out)


@router.post("/subscribe", response_model=ApiResponse[SubscribeResponse])
async def subscribe(
    body: SubscribeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    order_id, amount, currency, sub_id = await subscription_service.create_order(
        db, current_user.id, body.plan_id, body.offer_code
    )
    return ApiResponse(data=SubscribeResponse(
        order_id=order_id, amount=amount, currency=currency, razorpay_order_id=order_id,
    ))


@router.post("/verify", response_model=ApiResponse[MySubscriptionResponse])
async def verify_payment(
    body: VerifyPaymentRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    ok = subscription_service.verify_payment_signature(
        body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature,
    )
    if not ok:
        return ApiResponse(success=False, message="Invalid signature", data=None)
    sub = await subscription_service.activate_subscription(db, body.razorpay_order_id, current_user.id)
    if not sub:
        return ApiResponse(success=False, message="Subscription not found", data=None)
    return ApiResponse(data=MySubscriptionResponse(
        plan_name=sub.plan.name, status=sub.status,
        start_date=sub.start_date, end_date=sub.end_date,
        auto_renew=sub.auto_renew, amount_paid=sub.amount_paid, currency=sub.currency,
    ))


@router.get("/my", response_model=ApiResponse[MySubscriptionResponse | None])
async def my_subscription(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    sub = await subscription_service.get_my_subscription(db, current_user.id)
    if not sub:
        return ApiResponse(data=None, message="No active subscription")
    return ApiResponse(data=MySubscriptionResponse(
        plan_name=sub.plan.name, status=sub.status,
        start_date=sub.start_date, end_date=sub.end_date,
        auto_renew=sub.auto_renew, amount_paid=sub.amount_paid, currency=sub.currency,
    ))


@router.post("/cancel", response_model=ApiResponse[None])
async def cancel_auto_renew(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    await subscription_service.cancel_auto_renew(db, current_user.id)
    return ApiResponse(message="Auto-renewal cancelled")
