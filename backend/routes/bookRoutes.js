const express = require('express');
const {
  createBook, getBooks, getBookById, updateBook, deleteBook, getMyListings,
} = require('../controllers/bookController');
const { addReview, getBookReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getBooks);
router.get('/seller/my-listings', protect, authorize('seller', 'admin'), getMyListings);
router.get('/:id', getBookById);

router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 5), createBook);
router.put('/:id', protect, authorize('seller', 'admin'), updateBook);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteBook);

router.post('/:bookId/reviews', protect, addReview);
router.get('/:bookId/reviews', getBookReviews);

module.exports = router;
