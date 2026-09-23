const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const Notification = require('../models/Notification');

const ACTIVE_STATUSES = ['Pending Confirmation', 'Seller Confirmed', 'Admin Approved', 'Processing', 'Shipped', 'Out for Delivery'];
const CLOSED_STATUSES = ['Cancelled', 'Rejected', 'Returned'];

const notify = async (userId, type, message, link) => {
  try {
    await Notification.create({ user: userId, type, message, link });
  } catch (err) {
    // Notifications must never break the main order flow.
    console.error('Notification error:', err.message);
  }
};

// Puts stock back on the shelf for a set of order items (used on rollback,
// rejection, cancellation, or return).
const restockItems = async (items) => {
  for (const item of items) {
    const book = await Book.findById(item.book);
    if (!book) continue;
    book.stock += item.quantity;
    if (book.status === 'sold' && book.stock > 0) book.status = 'available';
    await book.save();
  }
};

// @desc    Create new order (checkout) with atomic, per-item stock checks
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }
  if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city || !shippingAddress.pincode || !shippingAddress.phone) {
    res.status(400);
    throw new Error('A complete shipping address (line1, city, pincode, phone) is required');
  }

  let itemsTotal = 0;
  const orderItems = [];
  const decremented = []; // for rollback on partial failure

  try {
    for (const item of items) {
      const quantity = Number(item.quantity) || 1;

      if (!mongoose.isValidObjectId(item.bookId)) {
        res.status(400);
        throw new Error('Invalid book reference in cart');
      }
      if (quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
      }

      // Atomic check-and-decrement: only succeeds if the book is still
      // available AND has enough stock. This prevents overselling when two
      // buyers check out the same limited-stock book at the same time.
      const book = await Book.findOneAndUpdate(
        { _id: item.bookId, status: 'available', stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!book) {
        const existing = await Book.findById(item.bookId);
        if (!existing) {
          res.status(404);
          throw new Error('One of the books in your cart no longer exists');
        }
        if (existing.status !== 'available') {
          res.status(409);
          throw new Error(`"${existing.title}" is no longer available for sale`);
        }
        res.status(409);
        throw new Error(
          `Insufficient stock for "${existing.title}" — only ${existing.stock} left, but ${quantity} requested`
        );
      }

      decremented.push({ book: book._id, quantity });

      if (book.stock === 0) {
        book.status = 'sold';
        await book.save();
      }

      itemsTotal += book.price * quantity;
      orderItems.push({
        book: book._id,
        seller: book.seller,
        title: book.title,
        price: book.price,
        quantity,
        sellerStatus: 'Pending',
      });
    }
  } catch (err) {
    // Roll back any stock we already decremented before the failure.
    if (decremented.length) await restockItems(decremented);
    throw err;
  }

  const shippingFee = itemsTotal > 500 ? 0 : 40;
  const totalAmount = itemsTotal + shippingFee;

  const order = new Order({
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsTotal,
    shippingFee,
    totalAmount,
  });
  order.pushHistory('Pending Confirmation', 'Order placed. Waiting for seller(s) to confirm availability.');
  await order.save();

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Notify every distinct seller involved in this order.
  const sellerIds = [...new Set(orderItems.map((i) => i.seller.toString()))];
  await Promise.all(
    sellerIds.map((sellerId) =>
      notify(sellerId, 'order', `New order received. Please confirm item availability.`, `/seller/orders`)
    )
  );

  res.status(201).json({ success: true, data: order });
});

// @desc  Get logged-in user's orders
// @route GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc  Get orders that contain items belonging to the logged-in seller
// @route GET /api/orders/seller-orders
// @access Private (seller/admin)
const getSellerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ 'items.seller': req.user._id })
    .populate('buyer', 'name email')
    .sort('-createdAt');

  // Trim to just this seller's own line items so a seller never sees what
  // another seller is selling within a shared order, only the shared
  // shipping/order-level info they need to fulfil their part.
  const scoped = orders.map((o) => {
    const obj = o.toObject();
    obj.items = obj.items.filter((i) => i.seller.toString() === req.user._id.toString());
    return obj;
  });

  res.json({ success: true, count: scoped.length, data: scoped });
});

// @desc  Get single order
// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('buyer', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.buyer._id.toString() === req.user._id.toString();
  const isInvolvedSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';

  if (!isBuyer && !isInvolvedSeller && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc  Lightweight order tracking (status timeline only)
// @route GET /api/orders/:id/track
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  const isInvolvedSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  const isAdmin = req.user.role === 'admin';
  if (!isBuyer && !isInvolvedSeller && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to track this order');
  }

  res.json({
    success: true,
    data: {
      _id: order._id,
      orderStatus: order.orderStatus,
      trackingNumber: order.trackingNumber,
      courier: order.courier,
      estimatedDelivery: order.estimatedDelivery,
      statusHistory: order.statusHistory,
    },
  });
});

// @desc  Public tracking lookup by tracking number (no order details leaked)
// @route GET /api/orders/track/:trackingNumber
// @access Public
const trackByNumber = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ trackingNumber: req.params.trackingNumber });
  if (!order) {
    res.status(404);
    throw new Error('No order found with this tracking number');
  }

  res.json({
    success: true,
    data: {
      trackingNumber: order.trackingNumber,
      orderStatus: order.orderStatus,
      courier: order.courier,
      estimatedDelivery: order.estimatedDelivery,
      statusHistory: order.statusHistory.map((h) => ({
        status: h.status,
        location: h.location,
        changedAt: h.changedAt,
      })),
    },
  });
});

// @desc  Seller confirms or rejects their line item(s) within an order
// @route PUT /api/orders/:id/seller-action
// @body  { bookId, action: 'confirm' | 'reject', note }
// @access Private (seller/admin)
const sellerActionOnItem = asyncHandler(async (req, res) => {
  const { bookId, action, note } = req.body;

  if (!['confirm', 'reject'].includes(action)) {
    res.status(400);
    throw new Error("Action must be 'confirm' or 'reject'");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus !== 'Pending Confirmation') {
    res.status(400);
    throw new Error(`This order is past the seller-confirmation stage (current status: ${order.orderStatus})`);
  }

  const item = order.items.find(
    (i) => i.book.toString() === bookId && i.seller.toString() === req.user._id.toString()
  );
  if (!item) {
    res.status(404);
    throw new Error('This item was not found in the order, or does not belong to you');
  }
  if (item.sellerStatus !== 'Pending') {
    res.status(400);
    throw new Error(`You already ${item.sellerStatus.toLowerCase()} this item`);
  }

  item.sellerStatus = action === 'confirm' ? 'Confirmed' : 'Rejected';
  item.sellerActionAt = new Date();
  item.sellerNote = note;

  if (action === 'reject') {
    // Give the stock back immediately since this seller can't fulfil it.
    await restockItems([{ book: item.book, quantity: item.quantity }]);

    // Recompute totals so the buyer is never charged for an item that was
    // rejected — only the still-active (non-rejected) items count.
    const activeItems = order.items.filter((i) => i.sellerStatus !== 'Rejected');
    order.itemsTotal = activeItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    order.shippingFee = order.itemsTotal > 500 || order.itemsTotal === 0 ? 0 : 40;
    order.totalAmount = order.itemsTotal + order.shippingFee;
  }

  const allDecided = order.recomputeSellerConfirmation();

  order.pushHistory(
    'Pending Confirmation',
    `${item.title} × ${item.quantity} was ${item.sellerStatus.toLowerCase()} by the seller${item.sellerNote ? ` ("${item.sellerNote}")` : ''}.`
  );

  if (allDecided) {
    if (order.sellerConfirmation.status === 'Rejected') {
      order.orderStatus = 'Rejected';
      order.pushHistory('Rejected', 'All sellers rejected their items. Order cancelled automatically.');
      await notify(order.buyer, 'order', 'Your order was rejected by the seller(s) and has been cancelled.', `/dashboard/orders`);
    } else {
      order.orderStatus = 'Seller Confirmed';
      order.pushHistory('Seller Confirmed', 'All sellers responded. Waiting for admin approval.');
      await notify(order.buyer, 'order', 'Seller(s) confirmed your order. Waiting for admin approval.', `/dashboard/orders`);
    }
  }

  await order.save();
  res.json({ success: true, data: order });
});

// @desc  Admin approves or rejects an order that has been seller-confirmed
// @route PUT /api/orders/:id/admin-approve
// @body  { action: 'approve' | 'reject', note }
// @access Private (admin)
const adminApproveOrder = asyncHandler(async (req, res) => {
  const { action, note } = req.body;
  if (!['approve', 'reject'].includes(action)) {
    res.status(400);
    throw new Error("Action must be 'approve' or 'reject'");
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.orderStatus !== 'Seller Confirmed') {
    res.status(400);
    throw new Error(`Order must be seller-confirmed before admin approval (current status: ${order.orderStatus})`);
  }

  order.adminApproval = {
    status: action === 'approve' ? 'Approved' : 'Rejected',
    by: req.user._id,
    at: new Date(),
    note,
  };

  if (action === 'approve') {
    order.orderStatus = 'Admin Approved';
    order.pushHistory('Admin Approved', note || 'Order approved by admin and will now be processed.');
    // Move straight into processing so the seller(s) know to pack the item(s).
    order.orderStatus = 'Processing';
    order.pushHistory('Processing', 'Order is being prepared for shipment.');
    await notify(order.buyer, 'order', 'Your order has been approved and is now being processed.', `/dashboard/orders`);
  } else {
    order.orderStatus = 'Rejected';
    order.pushHistory('Rejected', note || 'Order rejected by admin.');
    // Only the still-confirmed items had stock held against them — restock those.
    const confirmedItems = order.items.filter((i) => i.sellerStatus === 'Confirmed');
    await restockItems(confirmedItems);
    await notify(order.buyer, 'order', `Your order was rejected by admin${note ? `: ${note}` : '.'}`, `/dashboard/orders`);
  }

  await order.save();
  res.json({ success: true, data: order });
});

const SHIPPING_STAGE_ORDER = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

// @desc  Update shipment tracking (courier, location, stage)
// @route PUT /api/orders/:id/tracking
// @body  { status, location, note, courier, estimatedDelivery }
// @access Private (seller of an item in the order, or admin)
const updateTracking = asyncHandler(async (req, res) => {
  const { status, location, note, courier, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isInvolvedSeller = order.items.some((i) => i.seller.toString() === req.user._id.toString());
  if (req.user.role !== 'admin' && !isInvolvedSeller) {
    res.status(403);
    throw new Error('Not authorized to update tracking for this order');
  }

  if (CLOSED_STATUSES.includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Cannot update tracking on a ${order.orderStatus.toLowerCase()} order`);
  }
  if (!SHIPPING_STAGE_ORDER.includes(order.orderStatus) && order.orderStatus !== 'Admin Approved') {
    res.status(400);
    throw new Error('Order must be admin-approved before shipment tracking can begin');
  }
  if (status && !SHIPPING_STAGE_ORDER.includes(status)) {
    res.status(400);
    throw new Error(`Status must be one of: ${SHIPPING_STAGE_ORDER.join(', ')}`);
  }

  // Don't allow the shipment stage to go backwards by mistake.
  if (status) {
    const currentIdx = SHIPPING_STAGE_ORDER.indexOf(order.orderStatus);
    const nextIdx = SHIPPING_STAGE_ORDER.indexOf(status);
    if (nextIdx < currentIdx) {
      res.status(400);
      throw new Error(`Cannot move order backwards from "${order.orderStatus}" to "${status}"`);
    }
    order.orderStatus = status;
  }

  if (courier) order.courier = courier;
  if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
  if (!order.trackingNumber) order.generateTrackingNumber();

  order.pushHistory(status || order.orderStatus, note, location);

  if (order.orderStatus === 'Delivered') {
    order.isPaid = true;
    order.paidAt = order.paidAt || new Date();
  }

  await order.save();

  if (status) {
    await notify(order.buyer, 'order', `Your order is now "${status}".`, `/dashboard/orders`);
  }

  res.json({ success: true, data: order });
});

// @desc  Buyer cancels their own order (only while it hasn't shipped yet)
// @route PUT /api/orders/:id/cancel
// @body  { reason }
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isBuyer = order.buyer.toString() === req.user._id.toString();
  if (!isBuyer && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to cancel this order');
  }

  const cancellableStatuses = ['Pending Confirmation', 'Seller Confirmed', 'Admin Approved', 'Processing'];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Order can no longer be cancelled (current status: ${order.orderStatus})`);
  }

  // Restock whatever items hadn't already been rejected/restocked.
  const itemsToRestock = order.items.filter((i) => i.sellerStatus !== 'Rejected');
  await restockItems(itemsToRestock);

  order.orderStatus = 'Cancelled';
  order.cancelReason = req.body.reason;
  order.cancelledBy = req.user._id;
  order.pushHistory('Cancelled', req.body.reason || 'Order cancelled.');
  await order.save();

  const sellerIds = [...new Set(order.items.map((i) => i.seller.toString()))];
  await Promise.all(sellerIds.map((s) => notify(s, 'order', 'An order was cancelled by the buyer.', `/seller/orders`)));

  res.json({ success: true, data: order });
});

// @desc  Get all orders (admin), optionally filtered by status
// @route GET /api/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  const orders = await Order.find(filter).populate('buyer', 'name email').sort('-createdAt');
  res.json({ success: true, count: orders.length, data: orders });
});

module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getOrderById,
  trackOrder,
  trackByNumber,
  sellerActionOnItem,
  adminApproveOrder,
  updateTracking,
  cancelOrder,
  getAllOrders,
};
