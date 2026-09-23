const Razorpay = require('razorpay');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) 
  {
  console.warn(
    '[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set. UPI payments will fail until they are added to .env'
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
