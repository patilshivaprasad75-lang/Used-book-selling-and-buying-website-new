const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc  Add a review to a book
// @route POST /api/books/:bookId/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { bookId } = req.params;

  const alreadyReviewed = await Review.findOne({ book: bookId, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this book');
  }

  const review = await Review.create({
    book: bookId,
    user: req.user._id,
    rating,
    comment,
  });

  const reviews = await Review.find({ book: bookId });
  const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  await Book.findByIdAndUpdate(bookId, {
    ratingAvg: avg.toFixed(1),
    numReviews: reviews.length,
  });

  res.status(201).json({ success: true, data: review });
});

// @desc  Get reviews for a book
// @route GET /api/books/:bookId/reviews
const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'name avatar');
  res.json({ success: true, count: reviews.length, data: reviews });
});

module.exports = { addReview, getBookReviews };
