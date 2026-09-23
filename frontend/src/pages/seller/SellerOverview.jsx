import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyListings } from "../../api/books";
import { getSellerOrders } from "../../api/orders";
import { statusSlug } from "../../utils/orderStatus";
import Loader from "../../components/Loader";

export default function SellerOverview() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [listingsRes, ordersRes] = await Promise.all([
        getMyListings().catch(() => ({ data: [] })),
        getSellerOrders().catch(() => ({ data: [] })),
      ]);
      setListings(listingsRes.data || []);
      setOrders(ordersRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Keep the overview fresh if a buyer places a new order while this tab is open.
    const interval = setInterval(load, 20000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingOrders = orders.filter((o) => o.orderStatus === "Pending Confirmation").length;
  const activeListings = listings.filter((b) => b.status === "available").length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => (i.sellerStatus !== "Rejected" ? s + i.price * i.quantity : s), 0),
    0
  );

  if (loading) return <Loader label="Loading your seller dashboard..." />;

  return (
    <div className="dashboard-panel">
      <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
      <p className="muted">Here's a quick look at your selling activity.</p>

      <div className="quick-stats-grid">
        <div className="quick-stat">
          <strong>{listings.length}</strong>
          <span>My Listings</span>
        </div>
        <div className="quick-stat">
          <strong>{activeListings}</strong>
          <span>Active Listings</span>
        </div>
        <div className="quick-stat">
          <strong>{pendingOrders}</strong>
          <span>Orders Awaiting You</span>
        </div>
        <div className="quick-stat">
          <strong>₹{totalRevenue}</strong>
          <span>Total Order Value</span>
        </div>
      </div>

      <div className="flex-between">
        <h2 className="mb-0">Recent Orders To Fulfil</h2>
        <Link to="/seller/orders" className="btn btn-small">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="muted mt-30">
          No orders yet. <Link to="/sell-book">List a book</Link> to start selling.
        </p>
      ) : (
        <div className="table-wrap mt-30">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Date</th>
                <th>My Items</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.buyer?.name}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.length}</td>
                  <td>
                    <span className={`status status-${statusSlug(o.orderStatus)}`}>{o.orderStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
