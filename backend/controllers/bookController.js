const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');

// @desc    Create a new book listing
// @route   POST /api/books
// @access  Private (seller)
const createBook = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => ({
    url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
    contentType: f.mimetype,
  }));

  const book = await Book.create({
    ...req.body,
    seller: req.user._id,
    images,
  });

  res.status(201).json({ success: true, data: book });
});

// @desc    Get all books with search, filter, pagination
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const {
    keyword, category, minPrice, maxPrice, condition,
    sortBy = '-createdAt', page = 1, limit = 12,
  } = req.query;

  const query = { status: 'available' };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [books, total] = await Promise.all([
    Book.find(query)
      .populate('seller', 'name sellerProfile.shopName sellerProfile.rating')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit)),
    Book.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: books.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: books,
  });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).populate(
    'seller', 'name email sellerProfile'
  );

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  book.views += 1;
  await book.save();

  res.json({ success: true, data: book });
});

// @desc    Update book listing
// @route   PUT /api/books/:id
// @access  Private (owner seller / admin)
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  Object.assign(book, req.body);

  // Keep status and stock in sync when the seller edits the listing directly
  // (e.g. restocking a book that had sold out, or zeroing out stock).
  if (req.body.stock !== undefined) {
    const newStock = Number(req.body.stock);
    if (newStock < 0) {
      res.status(400);
      throw new Error('Stock cannot be negative');
    }
    if (newStock > 0 && book.status === 'sold') book.status = 'available';
    if (newStock === 0 && book.status === 'available') book.status = 'sold';
  }

  const updated = await book.save();
  res.json({ success: true, data: updated });
});

// @desc    Delete (soft-remove) book listing
// @route   DELETE /api/books/:id
// @access  Private (owner seller / admin)
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (book.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  book.status = 'removed';
  await book.save();
  res.json({ success: true, message: 'Book listing removed' });
});

// @desc    Get books listed by logged-in seller
// @route   GET /api/books/seller/my-listings
// @access  Private (seller)
const getMyListings = asyncHandler(async (req, res) => {
  const books = await Book.find({ seller: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: books.length, data: books });
});

module.exports = {
  createBook, getBooks, getBookById, updateBook, deleteBook, getMyListings,
};
