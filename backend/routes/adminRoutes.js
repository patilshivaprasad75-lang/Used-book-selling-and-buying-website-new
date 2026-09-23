const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorize('admin'));

// @desc Dashboard stats
// @route GET /api/admin/stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [userCount, bookCount, orderCount, revenueAgg, pendingApprovalCount] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments({ status: 'available' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.countDocuments({ orderStatus: 'Seller Confirmed' }),
    ]);

    res.json({
      success: true,
      data: {
        userCount,
        bookCount,
        orderCount,
        totalRevenue: revenueAgg[0]?.total || 0,
        pendingApprovalCount,
      },
    });
  })
);

// @desc Get all users
// @route GET /api/admin/users
router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  })
);

// @desc Block / unblock a user
// @route PUT /api/admin/users/:id/block
router.put(
  '/users/:id/block',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, data: user });
  })
);

module.exports = router;
