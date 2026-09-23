const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

connectDB();

const app = express();

// Tell Express it is running behind Render's load balancer
app.set('trust proxy', 1);

// Security & core middleware
app.use(helmet());

// --- UPDATED CORS CONFIGURATION ---
app.use(cors({ 
  origin: [
    "http://localhost:5173",
    "https://used-book-selling-and-buying-websit.vercel.app", // Trailing slash removed here
    process.env.CLIENT_URL 
  ].filter(Boolean), 
  credentials: true 
}));
// ----------------------------------

app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting (protects against brute-force / abuse)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', limiter);

// Routes
app.get('/', (req, res) => res.json({ message: 'Old Book Selling Management System API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server successfully started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});