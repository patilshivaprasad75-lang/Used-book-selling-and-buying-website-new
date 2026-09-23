const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Fiction', 'Non-Fiction', 'Academic', 'Competitive-Exam', 'Children',
        'Biography', 'Self-Help', 'Comics', 'Religious', 'Other',
      ],
    },
    condition: {
      type: String,
      enum: ['Like New', 'Good', 'Fair', 'Worn'],
      required: true,
    },
    language: { type: String, default: 'English' },
    edition: { type: String },
    originalPrice: { type: Number },
    price: { type: Number, required: true },
    // Images are stored directly in MongoDB as base64 data URIs (no external
    // cloud storage). `url` is a ready-to-use `data:<mime>;base64,...` string.
    images: [{ url: String, contentType: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stock: { type: Number, default: 1, min: 0 },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'removed'],
      default: 'available',
    },
    tags: [String],
    ratingAvg: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    aiPredictedPrice: { type: Number }, // suggested fair price via AI feature
    aiConditionScore: { type: Number }, // AI-scored condition from images
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', tags: 'text' });

module.exports = mongoose.model('Book', bookSchema);
