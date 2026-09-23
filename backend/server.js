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
<<<<<<< HEAD
const paymentRoutes = require('./routes/paymentRoutes');
=======
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a

connectDB();

const app = express();

// Security & core middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
<<<<<<< HEAD


app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }));

=======
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
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
<<<<<<< HEAD
app.use('/api/payments', paymentRoutes);
=======
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`));
