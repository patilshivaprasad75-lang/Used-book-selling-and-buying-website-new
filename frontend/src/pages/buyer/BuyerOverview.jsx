import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../api/orders";
import { statusSlug } from "../../utils/orderStatus";
import Loader from "../../components/Loader";

export default function BuyerOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyOrders();
        if (!cancelled) setOrders(res.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  if (loading) return <Loader label="Loading your dashboard..." />;

  return (
    <div className="dashboard-panel">
      <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
      <p className="muted">Here's a quick look at your OldBooks activity.</p>

      <div className="quick-stats-grid">
        <div className="quick-stat">
          <strong>{orders.length}</strong>
          <span>Total Orders</span>
        </div>
        <div className="quick-stat">
          <strong>₹{totalSpent}</strong>
          <span>Total Spent</span>
        </div>
        <div className="quick-stat">
          <strong className="role-badge" style={{ fontSize: "0.9rem" }}>
            {user?.role}
          </strong>
          <span>Account Type</span>
        </div>
      </div>

      <div className="flex-between">
        <h2 className="mb-0">Recent Orders</h2>
        <Link to="/dashboard/orders" className="btn btn-small">
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="muted mt-30">
          No orders yet. <Link to="/books">Browse books</Link> to get started.
        </p>
      ) : (
        <div className="table-wrap mt-30">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.length}</td>
                  <td>₹{o.totalAmount}</td>
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
