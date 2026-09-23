import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { createOrder } from "../api/orders";
<<<<<<< HEAD
import { createRazorpayOrder, verifyRazorpayPayment } from "../api/payments";
import { bookImageUrl } from "../api/books";
import { loadRazorpayScript } from "../utils/loadRazorpay";
=======
import { bookImageUrl } from "../api/books";
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a

export default function Checkout() {
  const { items, itemsTotal, clear } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const shipping = itemsTotal > 500 || itemsTotal === 0 ? 0 : 40;
  const grandTotal = itemsTotal + shipping;

  const handleChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

<<<<<<< HEAD
  // Opens the Razorpay checkout modal (restricted to UPI) for an
  // already-created order, and verifies the payment signature on success.
  const payWithUpi = async (order) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      setError("Could not load the UPI payment gateway. Your order is saved — you can retry payment from My Orders.");
      setPlacing(false);
      navigate(`/dashboard/orders`, { state: { newOrderId: order._id } });
      return;
    }

    try {
      const { data } = await createRazorpayOrder(order._id);

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Old Book Selling",
        description: `Order #${order._id}`,
        order_id: data.razorpayOrderId,
        // Restrict the checkout to UPI only (no cards/netbanking/wallets).
        method: { upi: true, card: false, netbanking: false, wallet: false, paylater: false },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: address.phone,
        },
        theme: { color: "#2f6f4f" },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Order placed.");
          } catch {
            toast.error("Payment was received but we couldn't confirm it automatically. We'll verify it shortly.");
          } finally {
            setPlacing(false);
            navigate(`/dashboard/orders`, { state: { newOrderId: order._id } });
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.info("Payment cancelled. Your order is saved as unpaid — you can retry it from My Orders.");
            navigate(`/dashboard/orders`, { state: { newOrderId: order._id } });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPlacing(false);
        setError("Payment failed. Your order is saved as unpaid — you can retry it from My Orders.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start UPI payment. Your order is saved as unpaid.");
      setPlacing(false);
    }
  };

=======
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ bookId: i.book._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
      };
      const res = await createOrder(payload);
<<<<<<< HEAD
      const order = res.data;
      await clear();

      if (paymentMethod === "UPI") {
        await payWithUpi(order); // handles its own navigation + setPlacing(false)
        return;
      }

      toast.success("Order placed successfully!");
      navigate(`/dashboard/orders`, { state: { newOrderId: order._id } });
    } catch (err) {
      setError(err.message || "Could not place order. Please try again.");
=======
      await clear();
      toast.success("Order placed successfully!");
      navigate(`/dashboard/orders`, { state: { newOrderId: res.data._id } });
    } catch (err) {
      setError(err.message || "Could not place order. Please try again.");
    } finally {
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="page-wrap text-center">
        <h2>Your cart is empty</h2>
        <p className="muted">Add some books before checking out.</p>
      </section>
    );
  }

  return (
    <section className="checkout-section">
      <h1>Checkout</h1>
      <form className="checkout-container" onSubmit={handlePlaceOrder}>
        <div className="checkout-form">
          <h2>Shipping Address</h2>
          {error && <div className="form-error">{error}</div>}
          <div className="input-group">
            <label>Phone Number</label>
            <input name="phone" value={address.phone} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Address Line 1</label>
            <input name="line1" value={address.line1} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Address Line 2 (optional)</label>
            <input name="line2" value={address.line2} onChange={handleChange} />
          </div>
          <div className="input-row">
            <div className="input-group">
              <label>City</label>
              <input name="city" value={address.city} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>State</label>
              <input name="state" value={address.state} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Pincode</label>
              <input name="pincode" value={address.pincode} onChange={handleChange} required />
            </div>
          </div>

          <h2>Payment Method</h2>
          <div className="payment-method">
<<<<<<< HEAD
            {["COD", "UPI"].map((m) => (
=======
            {["COD", "Card"].map((m) => (
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
              <label key={m}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m}
                  checked={paymentMethod === m}
                  onChange={() => setPaymentMethod(m)}
                />
                {m === "COD" ? "Cash on Delivery" : "UPI"}
              </label>
            ))}
          </div>

          <button type="submit" className="place-order-btn" disabled={placing}>
<<<<<<< HEAD
            {placing
              ? paymentMethod === "UPI"
                ? "Opening UPI payment..."
                : "Placing Order..."
              : `Place Order - ₹${grandTotal}`}
=======
            {placing ? "Placing Order..." : `Place Order - ₹${grandTotal}`}
>>>>>>> b6933976fd1fff027adfd9ab68569efae267122a
          </button>
        </div>

        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <p key={item.book._id} className="summary-item">
              <img src={bookImageUrl(item.book)} alt={item.book.title} />
              <span style={{ flex: 1 }}>
                {item.book.title} <span className="muted">x{item.quantity}</span>
              </span>
              <span>₹{item.book.price * item.quantity}</span>
            </p>
          ))}
          <hr />
          <p>Subtotal: ₹{itemsTotal}</p>
          <p>Shipping: {shipping === 0 ? "Free" : `₹${shipping}`}</p>
          <hr />
          <h3>Total: ₹{grandTotal}</h3>
        </div>
      </form>
    </section>
  );
}
