import { api } from "./client";

// POST /api/payments/razorpay/order { orderId }
// -> { razorpayOrderId, amount, currency, keyId, orderId }
export const createRazorpayOrder = (orderId) => api.post("/payments/razorpay/order", { orderId });

// POST /api/payments/razorpay/verify { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyRazorpayPayment = (payload) => api.post("/payments/razorpay/verify", payload);
