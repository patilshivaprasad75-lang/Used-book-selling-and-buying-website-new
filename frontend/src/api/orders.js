import { api } from "./client";

// POST /api/orders
export const createOrder = (payload) => api.post("/api/orders", payload);

// GET /api/orders/my-orders
export const getMyOrders = () => api.get("/api/orders/my-orders");

// GET /api/orders/seller-orders
export const getSellerOrders = () => api.get("/api/orders/seller-orders");

// GET /api/orders (admin), optional status filter
export const getAllOrders = (status) => api.get(`/api/orders${status ? `?status=${encodeURIComponent(status)}` : ""}`);

// GET /api/orders/:id
export const getOrderById = (id) => api.get(`/api/orders/${id}`);

// GET /api/orders/:id/track
export const trackOrder = (id) => api.get(`/api/orders/${id}/track`);

// GET /api/orders/track/:trackingNumber (public)
export const trackByNumber = (trackingNumber) => api.get(`/api/orders/track/${encodeURIComponent(trackingNumber)}`);

// PUT /api/orders/:id/seller-action
export const sellerActionOnItem = (id, bookId, action, note) =>
  api.put(`/api/orders/${id}/seller-action`, { bookId, action, note });

// PUT /api/orders/:id/admin-approve
export const adminApproveOrder = (id, action, note) => api.put(`/api/orders/${id}/admin-approve`, { action, note });

// PUT /api/orders/:id/tracking
export const updateTracking = (id, payload) => api.put(`/api/orders/${id}/tracking`, payload);

// PUT /api/orders/:id/cancel
export const cancelOrder = (id, reason) => api.put(`/api/orders/${id}/cancel`, { reason });