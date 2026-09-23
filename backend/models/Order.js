const mongoose = require('mongoose');
const crypto = require('crypto');

const orderItemSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    price: Number,
    quantity: { type: Number, default: 1, min: 1 },
    // Per-item seller decision. An order can contain books from several
    // sellers, so each line item is confirmed/rejected independently.
    sellerStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Rejected'],
      default: 'Pending',
    },
    sellerActionAt: Date,
    sellerNote: String,
  },
  { _id: false }
);

// A single entry in the order's timeline. Used both for status changes and
// for shipment tracking updates (courier scans, location changes, etc.),
// so the buyer sees one unified, chronological tracking history.
const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    location: String,
    note: String,
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
      phone: String,
    },
<<<<<<< HEAD
    paymentMethod: { type: String, enum: ['COD', 'Card', 'UPI'], default: 'COD' },
=======
    paymentMethod: { type: String, enum: ['COD', 'Card'], default: 'COD' },
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
    },
<<<<<<< HEAD
    // Set once a Razorpay order is created for this order, so we can match
    // the payment back to it and verify the signature on completion.
    razorpayOrderId: String,
=======
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    // Overall order lifecycle. Every order must pass through seller
    // confirmation and then admin approval before it can be processed.
    orderStatus: {
      type: String,
      enum: [
        'Pending Confirmation', // just placed, waiting on seller(s)
        'Seller Confirmed',     // seller(s) confirmed, waiting on admin
        'Admin Approved',       // admin approved, about to enter processing
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Rejected',
        'Returned',
      ],
      default: 'Pending Confirmation',
    },

    sellerConfirmation: {
      status: {
        type: String,
        enum: ['Pending', 'Partially Confirmed', 'Confirmed', 'Rejected'],
        default: 'Pending',
      },
    },

    adminApproval: {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      at: Date,
      note: String,
    },

    // Shipment tracking
    trackingNumber: { type: String, unique: true, sparse: true },
    courier: String,
    estimatedDelivery: Date,

    // Unified timeline: order-status changes AND tracking/location updates.
    statusHistory: [timelineEventSchema],

    cancelReason: String,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.methods.pushHistory = function (status, note, location) {
  this.statusHistory.push({ status, note, location });
};

orderSchema.methods.generateTrackingNumber = function () {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  this.trackingNumber = `OB${rand}`;
  return this.trackingNumber;
};

// Recomputes items[].sellerStatus -> sellerConfirmation.status, and returns
// whether every item has now been decided by its seller (Confirmed/Rejected).
orderSchema.methods.recomputeSellerConfirmation = function () {
  const statuses = this.items.map((i) => i.sellerStatus);
  const allRejected = statuses.every((s) => s === 'Rejected');
  const allDecided = statuses.every((s) => s !== 'Pending');
  const anyConfirmed = statuses.some((s) => s === 'Confirmed');

  if (allRejected) {
    this.sellerConfirmation.status = 'Rejected';
  } else if (allDecided && anyConfirmed) {
    this.sellerConfirmation.status = 'Confirmed';
  } else if (statuses.some((s) => s !== 'Pending')) {
    this.sellerConfirmation.status = 'Partially Confirmed';
  } else {
    this.sellerConfirmation.status = 'Pending';
  }

  return allDecided;
};

module.exports = mongoose.model('Order', orderSchema);
