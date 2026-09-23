const express = require('express');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:bookId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
