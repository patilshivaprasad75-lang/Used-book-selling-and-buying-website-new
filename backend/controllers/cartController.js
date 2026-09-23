const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc  Get logged-in user's cart
// @route GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json({ success: true, data: cart });
});

// @desc  Add item to cart
// @route POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { bookId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((i) => i.book.toString() === bookId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ book: bookId, quantity });
  }

  await cart.save();
  res.status(201).json({ success: true, data: cart });
});

// @desc  Remove item from cart
// @route DELETE /api/cart/:bookId
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((i) => i.book.toString() !== req.params.bookId);
  await cart.save();
  res.json({ success: true, data: cart });
});

// @desc  Clear cart
// @route DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };
