import { api } from "./client";

// GET /api/admin/stats
export const getAdminStats = () => api.get("/api/admin/stats");

// GET /api/admin/users
export const getAllUsers = () => api.get("/api/admin/users");

// PUT /api/admin/users/:id/block
export const toggleBlockUser = (id) => api.put(`/api/admin/users/${id}/block`, {});