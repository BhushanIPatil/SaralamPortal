import { appConfig } from '@/config/env'
import { subscriptionsApi } from '@/lib/api/endpoints/subscriptions'

export interface RazorpayOrder {
  razorpay_order_id: string
  amount: number
  currency: string
  plan_name: string
  plan_id?: string
}

export interface UserInfo {
  name: string
  email: string
}

export interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export async function initRazorpayCheckout(
  order: RazorpayOrder,
  userInfo: UserInfo,
  onSuccess?: () => void,
  onDismiss?: () => void
) {
  if (!appConfig.razorpayKeyId) {
    console.warn('Razorpay key not configured')
    onDismiss?.()
    return
  }
  const options = {
    key: appConfig.razorpayKeyId,
    order_id: order.razorpay_order_id,
    name: 'Saralam',
    description: `${order.plan_name} Subscription`,
    prefill: { name: userInfo.name, email: userInfo.email },
    theme: { color: '#1a56db' },
    handler: async (response: RazorpayResponse) => {
      try {
        await subscriptionsApi.verify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        })
        onSuccess?.()
      } catch (e) {
        console.error('Payment verification failed', e)
      }
    },
    modal: {
      ondismiss: onDismiss,
    },
  }
  const rzp = new window.Razorpay(options)
  rzp.open()
}
