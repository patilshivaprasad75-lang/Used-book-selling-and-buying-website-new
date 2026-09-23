const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');

const run = async () => {
  await connectDB();

  await User.deleteMany();
  await Book.deleteMany();

  const admin = await User.create({
    name: 'Admin', email: 'admin@bookstore.com', password: 'admin123', role: 'admin',
  });
  const seller = await User.create({
    name: 'Rahul Seller', email: 'seller@bookstore.com', password: 'seller123', role: 'seller',
  });
  await User.create({
    name: 'Priya Buyer', email: 'buyer@bookstore.com', password: 'buyer123', role: 'buyer',
  });

  await Book.create([
    {
      title: 'Introduction to Algorithms', author: 'Thomas H. Cormen',
      description: 'Classic CS textbook, some highlighting on early chapters.',
      category: 'Academic', condition: 'Good', price: 450, originalPrice: 1200,
      seller: seller._id, images: [],
    },
    {
      title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam',
      description: 'Autobiography, well maintained, no markings.',
      category: 'Biography', condition: 'Like New', price: 120, originalPrice: 250,
      seller: seller._id, images: [],
    },
  ]);

  console.log('Seed data inserted successfully');
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
