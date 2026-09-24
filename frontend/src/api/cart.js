import { api } from "./client";

// GET /api/cart
export const getCart = () => api.get("/api/cart");

// POST /api/cart { bookId, quantity }
export const addToCart = (bookId, quantity = 1) => api.post("/api/cart", { bookId, quantity });

// DELETE /api/cart/:bookId
export const removeFromCart = (bookId) => api.del(`/api/cart/${bookId}`);

// DELETE /api/cart
export const clearCart = () => api.del("/api/cart");