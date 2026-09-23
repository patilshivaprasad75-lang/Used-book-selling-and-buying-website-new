import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/admin";
import { getAllOrders } from "../../api/orders";
import { statusSlug } from "../../utils/orderStatus";
import Loader from "../../components/Loader";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([getAdminStats(), getAllOrders()]);
        if (!cancelled) {
          setStats(statsRes.data);
          setRecentOrders((ordersRes.data || []).slice(0, 6));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader label="Loading admin dashboard..." />;

  return (
    <div className="dashboard-panel">
      <h1>Admin Dashboard</h1>
      <p className="muted">Platform overview at a glance.</p>

      <div className="quick-stats-grid">
        <div className="quick-stat">
          <strong>{stats?.userCount ?? 0}</strong>
          <span>Total Users</span>
        </div>
        <div className="quick-stat">
          <strong>{stats?.bookCount ?? 0}</strong>
          <span>Available Books</span>
        </div>
        <div className="quick-stat">
          <strong>{stats?.orderCount ?? 0}</strong>
          <span>Total Orders</span>
        </div>
        <div className="quick-stat">
          <strong>₹{stats?.totalRevenue ?? 0}</strong>
          <span>Total Revenue</span>
        </div>
        <div className="quick-stat">
          <strong>{stats?.pendingApprovalCount ?? 0}</strong>
          <span>Awaiting Your Approval</span>
        </div>
      </div>

      <div className="chip-row" style={{ marginBottom: 30 }}>
        <Link to="/admin/add-book" className="btn btn-primary btn-small">
          <i className="fas fa-plus" /> Add Book
        </Link>
        <Link to="/admin/users" className="btn btn-small">
          <i className="fas fa-user-check" /> Manage Users
        </Link>
        <Link to="/admin/orders" className="btn btn-small">
          <i className="fas fa-shopping-cart" /> View Orders
        </Link>
      </div>

      <div className="flex-between">
        <h2 className="mb-0">Recent Orders</h2>
        <Link to="/admin/orders" className="btn btn-small">
          View All
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p className="muted mt-30">No orders placed yet.</p>
      ) : (
        <div className="table-wrap mt-30">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>{o.buyer?.name || "—"}</td>
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
