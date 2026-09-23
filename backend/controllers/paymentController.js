const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');

// @desc    Create a Razorpay order so the frontend can open the UPI checkout
//          for an existing (already-placed) order
// @route   POST /api/payments/razorpay/order
// @body    { orderId }
// @access  Private (buyer who owns the order)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to pay for this order');
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error('This order has already been paid for');
  }

  // Razorpay expects the amount in the smallest currency unit (paise for INR).
  const amountInPaise = Math.round(order.totalAmount * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString(), buyer: req.user._id.toString() },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  res.json({
    success: true,
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
    },
  });
});

// @desc    Verify a completed Razorpay/UPI payment and mark the order paid.
//          Never trust the client's word that payment succeeded — the HMAC
//          signature is the only proof that it actually came from Razorpay.
// @route   POST /api/payments/razorpay/verify
// @body    { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// @access  Private (buyer who owns the order)
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error('Missing payment verification details');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized for this order');
  }
  if (order.razorpayOrderId !== razorpay_order_id) {
    res.status(400);
    throw new Error('Razorpay order mismatch');
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed — signature mismatch');
  }

  if (!order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'paid',
      updateTime: new Date().toISOString(),
    };
    order.pushHistory(order.orderStatus, 'Payment received via UPI (Razorpay).');
    await order.save();
  }

  res.json({ success: true, data: order });
});

// @desc    Razorpay webhook — a backup confirmation path in case the buyer's
//          browser closes/loses connection before /verify is called.
// @route   POST /api/payments/razorpay/webhook
// @access  Public (authenticated via the webhook signature, not a JWT)
const razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!secret) {
    return res.status(400).json({ success: false, message: 'Webhook secret not configured' });
  }

  // req.body is the raw Buffer here (see server.js), which is required for
  // the signature check to match what Razorpay computed.
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (signature !== expected) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = JSON.parse(req.body.toString('utf8'));

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = { id: payment.id, status: 'paid', updateTime: new Date().toISOString() };
      order.pushHistory(order.orderStatus, 'Payment confirmed via Razorpay webhook.');
      await order.save();
    }
  }

  res.json({ received: true });
});

module.exports = { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook };
