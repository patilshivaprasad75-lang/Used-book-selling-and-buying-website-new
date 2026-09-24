import { api } from "./client";

// GET /api/books?keyword=&category=&minPrice=&maxPrice=&condition=&sortBy=&page=&limit=
export const getBooks = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null)
  ).toString();
  return api.get(`/api/books${query ? `?${query}` : ""}`);
};

// GET /api/books/:id
export const getBookById = (id) => api.get(`/api/books/${id}`);

// GET /api/books/seller/my-listings
export const getMyListings = () => api.get("/api/books/seller/my-listings");

// POST /api/books (multipart, field name "images", up to 5)
export const createBook = (fields, imageFiles = []) => {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") form.append(key, value);
  });
  imageFiles.forEach((file) => form.append("images", file));

  // isForm: true -> no JSON Content-Type (the browser sets the multipart boundary),
  // and the shared client still attaches the Authorization: Bearer <token> header.
  return api.post("/api/books", form, { isForm: true });
};

// PUT /api/books/:id
export const updateBook = (id, payload) => api.put(`/api/books/${id}`, payload);

// DELETE /api/books/:id
export const deleteBook = (id) => api.del(`/api/books/${id}`);

// POST /api/books/:bookId/reviews
export const addReview = (bookId, payload) => api.post(`/api/books/${bookId}/reviews`, payload);

// GET /api/books/:bookId/reviews
export const getBookReviews = (bookId) => api.get(`/api/books/${bookId}/reviews`);

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