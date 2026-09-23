import { api } from "./client";

// POST /api/orders { items:[{bookId,quantity}], shippingAddress, paymentMethod }
export const createOrder = (payload) => api.post("/orders", payload);

// GET /api/orders/my-orders
export const getMyOrders = () => api.get("/orders/my-orders");

// GET /api/orders/seller-orders (seller/admin) — orders containing this seller's items
export const getSellerOrders = () => api.get("/orders/seller-orders");

// GET /api/orders (admin), optional status filter
export const getAllOrders = (status) => api.get(`/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`);

// GET /api/orders/:id
export const getOrderById = (id) => api.get(`/orders/${id}`);

// GET /api/orders/:id/track — status timeline only
export const trackOrder = (id) => api.get(`/orders/${id}/track`);

// GET /api/orders/track/:trackingNumber — public lookup, no auth
export const trackByNumber = (trackingNumber) => api.get(`/orders/track/${encodeURIComponent(trackingNumber)}`);

// PUT /api/orders/:id/seller-action { bookId, action: 'confirm'|'reject', note }
export const sellerActionOnItem = (id, bookId, action, note) =>
  api.put(`/orders/${id}/seller-action`, { bookId, action, note });

// PUT /api/orders/:id/admin-approve { action: 'approve'|'reject', note }
export const adminApproveOrder = (id, action, note) => api.put(`/orders/${id}/admin-approve`, { action, note });

// PUT /api/orders/:id/tracking { status, location, note, courier, estimatedDelivery }
export const updateTracking = (id, payload) => api.put(`/orders/${id}/tracking`, payload);

// PUT /api/orders/:id/cancel { reason }
export const cancelOrder = (id, reason) => api.put(`/orders/${id}/cancel`, { reason });
