import apiClient from '../client'

export const subscriptionsApi = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  subscribe: (data: { plan_id: string; offer_code?: string }) =>
    apiClient.post('/subscriptions/subscribe', data),
  verify: (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => apiClient.post('/subscriptions/verify', data),
  getMy: () => apiClient.get('/subscriptions/my'),
  cancel: () => apiClient.post('/subscriptions/cancel'),
  getPaymentHistory: () => apiClient.get('/subscriptions/payment-history'),
}
