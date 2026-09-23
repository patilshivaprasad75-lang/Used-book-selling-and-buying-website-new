const express = require('express');
const {
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
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public tracking lookup by tracking number (no auth required)
router.get('/track/:trackingNumber', trackByNumber);

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/seller-orders', authorize('seller', 'admin'), getSellerOrders);
router.get('/', authorize('admin'), getAllOrders);

router.get('/:id', getOrderById);
router.get('/:id/track', trackOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/seller-action', authorize('seller', 'admin'), sellerActionOnItem);
router.put('/:id/admin-approve', authorize('admin'), adminApproveOrder);
router.put('/:id/tracking', authorize('seller', 'admin'), updateTracking);

module.exports = router;
