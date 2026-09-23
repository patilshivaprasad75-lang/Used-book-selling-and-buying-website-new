# Old Book Selling Management System — Backend

Node.js + Express + MongoDB REST API for a peer-to-peer old book marketplace.

## Setup

```bash
npm install
cp .env.example .env   # fill in your own values
npm run seed            # optional: inserts demo admin/seller/buyer + 2 books
npm run dev              # starts on http://localhost:5000
```

## Demo credentials (after seeding)

| Role   | Email                | Password   |
|--------|-----------------------|------------|
| Admin  | admin@bookstore.com  | admin123   |
| Seller | seller@bookstore.com | seller123  |
| Buyer  | buyer@bookstore.com  | buyer123   |

## Folder structure

```
old-book-backend/
├── config/        # DB + Cloudinary config
├── controllers/    # Route handler logic
├── middleware/    # auth, error handling, file upload
├── models/        # Mongoose schemas
├── routes/        # Express routers
├── utils/         # seed script, helpers
├── server.js
└── .env.example
```

## API Endpoints

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|-----------------------|---------|---------------------|
| POST   | /api/auth/register    | Public  | Register user       |
| POST   | /api/auth/login       | Public  | Login, returns JWT   |
| GET    | /api/auth/profile     | Private | Get own profile      |
| PUT    | /api/auth/profile     | Private | Update own profile   |

### Books
| Method | Endpoint                     | Access         | Description             |
|--------|-------------------------------|----------------|--------------------------|
| GET    | /api/books                    | Public         | List/search/filter books |
| GET    | /api/books/:id                 | Public         | Book detail              |
| POST   | /api/books                     | Seller/Admin   | Create listing (with images) |
| PUT    | /api/books/:id                 | Owner/Admin    | Update listing            |
| DELETE | /api/books/:id                 | Owner/Admin    | Remove listing             |
| GET    | /api/books/seller/my-listings  | Seller         | My listings                |
| POST   | /api/books/:bookId/reviews     | Private        | Add review                 |
| GET    | /api/books/:bookId/reviews     | Public         | List reviews                |

### Cart
| Method | Endpoint          | Access  |
|--------|--------------------|---------|
| GET    | /api/cart          | Private |
| POST   | /api/cart          | Private |
| DELETE | /api/cart/:bookId  | Private |
| DELETE | /api/cart          | Private |

### Orders

The order lifecycle now requires **two-step confirmation** before an order
ships: the seller(s) whose books are in the order must confirm availability,
then an admin must approve it. Only after admin approval can shipment
tracking be updated.

```
Pending Confirmation → Seller Confirmed → Admin Approved → Processing
  → Shipped → Out for Delivery → Delivered
(or → Rejected / Cancelled / Returned at various points)
```

Stock is decremented atomically at checkout (`stock >= quantity` check +
`$inc` in one query) so two buyers can never oversell the same copy. Stock
is automatically restored if a seller rejects an item, an admin rejects the
order, or the buyer cancels.

| Method | Endpoint                          | Access             | Description |
|--------|-------------------------------------|--------------------|--------------|
| POST   | /api/orders                         | Private            | Checkout — validates & reserves stock per item |
| GET    | /api/orders/my-orders                | Private            | Buyer's own orders |
| GET    | /api/orders/seller-orders             | Seller/Admin       | Orders containing this seller's items |
| GET    | /api/orders                          | Admin              | All orders (optional `?status=` filter) |
| GET    | /api/orders/:id                       | Buyer/Seller/Admin | Order detail |
| GET    | /api/orders/:id/track                  | Buyer/Seller/Admin | Status timeline only |
| GET    | /api/orders/track/:trackingNumber       | Public             | Lookup by tracking number |
| PUT    | /api/orders/:id/seller-action           | Seller/Admin       | `{ bookId, action: 'confirm'|'reject', note }` |
| PUT    | /api/orders/:id/admin-approve           | Admin              | `{ action: 'approve'|'reject', note }` |
| PUT    | /api/orders/:id/tracking                | Seller/Admin       | `{ status, location, note, courier, estimatedDelivery }` |
| PUT    | /api/orders/:id/cancel                  | Buyer/Admin        | `{ reason }` — only before shipment |

### Notifications
| Method | Endpoint                     | Access  |
|--------|--------------------------------|---------|
| GET    | /api/notifications              | Private |
| PUT    | /api/notifications/:id/read      | Private |
| PUT    | /api/notifications/read-all      | Private |

### Admin
| Method | Endpoint                   | Access |
|--------|------------------------------|--------|
| GET    | /api/admin/stats             | Admin  |
| GET    | /api/admin/users              | Admin  |
| PUT    | /api/admin/users/:id/block    | Admin  |

## Deployment (Vercel)

1. Push this backend to its own GitHub repo.
2. Add `vercel.json` (see below) so Vercel treats `server.js` as a serverless function.
3. In Vercel dashboard: New Project → import repo → add all `.env` variables under Settings → Environment Variables.
4. Use MongoDB Atlas (not a local Mongo instance) since Vercel functions are stateless.

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
