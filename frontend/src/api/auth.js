import { api } from "./client";

// POST /api/auth/register -> { success, data: { _id, name, email, role, token } }
export const registerUser = (payload) => api.post("/api/auth/register", payload);

// POST /api/auth/login -> { success, data: { _id, name, email, role, token } }
export const loginUser = (payload) => api.post("/api/auth/login", payload);

// GET /api/auth/profile -> { success, data: user }
export const getProfile = () => api.get("/api/auth/profile");

// PUT /api/auth/profile -> { success, data: user }
export const updateProfile = (payload) => api.put("/api/auth/profile", payload);