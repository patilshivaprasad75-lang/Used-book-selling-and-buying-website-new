import { api, API_BASE_URL, getToken } from "./client";

// GET /api/books?keyword=&category=&minPrice=&maxPrice=&condition=&sortBy=&page=&limit=
export const getBooks = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
  ).toString();
  return api.get(`/books${query ? `?${query}` : ""}`);
};

// GET /api/books/:id
export const getBookById = (id) => api.get(`/books/${id}`);

// GET /api/books/seller/my-listings
export const getMyListings = () => api.get("/books/seller/my-listings");

// POST /api/books (multipart, field name "images", up to 5)
export const createBook = async (fields, imageFiles = []) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") form.append(key, value);
  });
  imageFiles.forEach((file) => form.append("images", file));

  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Failed to create book listing");
  return data;
};

// PUT /api/books/:id
export const updateBook = (id, payload) => api.put(`/books/${id}`, payload);

// DELETE /api/books/:id
export const deleteBook = (id) => api.del(`/books/${id}`);

// POST /api/books/:bookId/reviews
export const addReview = (bookId, payload) => api.post(`/books/${bookId}/reviews`, payload);

// GET /api/books/:bookId/reviews
export const getBookReviews = (bookId) => api.get(`/books/${bookId}/reviews`);

export const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Academic",
  "Competitive-Exam",
  "Children",
  "Biography",
  "Self-Help",
  "Comics",
  "Religious",
  "Other",
];

export const CONDITIONS = ["Like New", "Good", "Fair", "Worn"];

export function bookImageUrl(book) {
  const first = book?.images?.[0]?.url;
  return first || `https://via.placeholder.com/400x520/1e293b/f59e0b?text=${encodeURIComponent(book?.title || "Book")}`;
}
