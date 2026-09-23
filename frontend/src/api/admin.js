import { api } from "./client";

// GET /api/admin/stats
export const getAdminStats = () => api.get("/admin/stats");

// GET /api/admin/users
export const getAllUsers = () => api.get("/admin/users");

// PUT /api/admin/users/:id/block
export const toggleBlockUser = (id) => api.put(`/admin/users/${id}/block`, {});
