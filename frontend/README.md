# OldBooks — React Frontend

A full React (Vite) rebuild of the original HTML/CSS/JS "Old Books Selling Management System" frontend, wired up to the provided Node/Express + MongoDB backend.

## What's inside

- **React 19 + Vite** app, React Router for routing, Context API for auth/cart/toasts.
- Original dark/amber visual design preserved (`src/styles/legacy.css` is your original stylesheet, almost untouched) plus a polish layer (`src/styles/enhancements.css`) for loaders, toasts, tables, dashboards, pagination, etc. that the plain HTML site didn't have.
- Every page from the old site rebuilt as a component and **wired to real backend endpoints** (no mock data):
  - Public: Home, Books (search/filter/sort/pagination), Book Details (gallery, reviews), About, Contact, Sell a Book.
  - Auth: Login, Register, Forgot Password.
  - Buyer dashboard: Overview, Orders (with status history), Wishlist, Profile settings.
  - Seller dashboard: My Listings (add/remove books) — same dashboard, shown only for seller/admin accounts.
  - Admin dashboard: Overview stats, Manage Books, Manage Users (block/unblock), View & update Orders, Revenue analytics, Add Book.
- Route guards: `ProtectedRoute` (must be logged in), `AdminRoute` (must be admin), `GuestRoute` (redirects logged-in users away from login/register).

## 1. Configure the API URL

Copy `.env.example` to `.env` (already done for you) and point it at your running backend:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 2. Install & run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default — which is exactly what the backend's `CLIENT_URL` in its `.env` already expects for CORS.

## 3. Run the backend alongside it

From the backend project:

```bash
npm install
npm run dev   # nodemon server.js, defaults to port 5000
```

Make sure the backend's `.env` has a real `MONGO_URI` it can reach, and a `JWT_SECRET`. Two things to double check before demoing:

- **Image uploads** (Sell a Book / Admin → Add Book) go through `multer-storage-cloudinary`, so `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` in the backend `.env` need to be real values, or book creation with images will fail. Listing a book with no images still works fine.
- **Password reset** (Forgot Password page) has no backend route yet — the page is a friendly placeholder that says so. Wire up `POST /api/auth/forgot-password` + `reset-password` on the backend and update `src/pages/ForgotPassword.jsx` to call it once that exists.

## 4. Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy it to any static host (Vercel, Netlify, Nginx, etc.) and point `VITE_API_BASE_URL` at your deployed backend.

## Project structure

```
src/
  api/            fetch wrappers per backend resource (auth, books, cart, orders, admin)
  context/        AuthContext, CartContext, ToastContext
  components/     Navbar, Footer, BookCard, StarRating, Loader, route guards
  pages/          public pages + user/ and admin/ nested dashboards
  styles/         legacy.css (your original design) + enhancements.css
```

## Notes on data that isn't in the backend yet

- **Wishlist**: the `User` model has a `wishlist` field but no routes to read/write it, so the heart button and Wishlist page use `localStorage` for now (per-browser). Swap in real API calls once wishlist routes exist.
- **Contact form**: there's no `/api/contact` route, so submissions just show a success toast client-side. Point it at a real endpoint (or an email service) when you add one.
