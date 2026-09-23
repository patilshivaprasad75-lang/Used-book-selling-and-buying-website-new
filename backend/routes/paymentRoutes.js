const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Razorpay calls this directly (no JWT) — it's authenticated via the
// x-razorpay-signature header instead. Must stay above router.use(protect).
router.post('/razorpay/webhook', razorpayWebhook);

router.use(protect);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

module.exports = router;
