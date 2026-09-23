import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Loader, { EmptyState } from "../components/Loader";
import { bookImageUrl } from "../api/books";

export default function Cart() {
  const { items, itemsTotal, loading, remove, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleRemove = async (bookId) => {
    try {
      await remove(bookId);
      toast.info("Removed from cart");
    } catch (err) {
      toast.error(err.message || "Could not remove item");
    }
  };

  const handleClear = async () => {
    try {
      await clear();
      toast.info("Cart cleared");
    } catch (err) {
      toast.error(err.message || "Could not clear cart");
    }
  };

  if (loading) return <Loader label="Loading your cart..." />;

  if (items.length === 0) {
    return (
      <section className="page-wrap">
        <EmptyState
          icon="fa-cart-shopping"
          title="Your cart is empty"
          message="Browse our collection and add some books you love."
          action={
            <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
              Browse Books
            </Link>
          }
        />
      </section>
    );
  }

  const shipping = itemsTotal > 500 || itemsTotal === 0 ? 0 : 40;
  const grandTotal = itemsTotal + shipping;

  return (
    <section className="cart-section">
      <h1>Your Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          {items.map((item) => {
            const book = item.book;
            if (!book) return null;
            return (
              <div className="cart-item" key={book._id}>
                <img src={bookImageUrl(book)} alt={book.title} />
                <div className="cart-info">
                  <h3>{book.title}</h3>
                  <p className="muted" style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                    by {book.author}
                  </p>
                  <p>
                    <i className="fas fa-indian-rupee-sign" /> {book.price} x {item.quantity} = ₹
                    {book.price * item.quantity}
                  </p>
                </div>
                <button className="remove-btn" onClick={() => handleRemove(book._id)}>
                  <i className="fas fa-trash" /> Remove
                </button>
              </div>
            );
          })}
          <button className="btn" onClick={handleClear} style={{ alignSelf: "flex-start" }}>
            Clear Cart
          </button>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <p>
            Subtotal: <strong>₹{itemsTotal}</strong>
          </p>
          <p>Shipping: {shipping === 0 ? "Free" : `₹${shipping}`}</p>
          <h3>Total: ₹{grandTotal}</h3>
          <button className="checkout-btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
          <Link to="/books" className="btn btn-full" style={{ marginTop: 12, textAlign: "center", display: "block" }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
