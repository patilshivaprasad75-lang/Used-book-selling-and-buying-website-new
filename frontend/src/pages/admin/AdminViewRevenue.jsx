import { useEffect, useMemo, useState } from "react";
import { getAdminStats } from "../../api/admin";
import { getAllOrders } from "../../api/orders";
import Loader from "../../components/Loader";

export default function AdminViewRevenue() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([getAdminStats(), getAllOrders()]);
        if (!cancelled) {
          setStats(statsRes.data);
          setOrders(ordersRes.data || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthly = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
      map[key] = (map[key] || 0) + (o.totalAmount || 0);
    });
    return Object.entries(map).slice(-6);
  }, [orders]);

  const maxVal = Math.max(1, ...monthly.map(([, v]) => v));

  if (loading) return <Loader label="Crunching the numbers..." />;

  return (
    <div className="dashboard-panel">
      <h1>Revenue & Analytics</h1>

      <div className="quick-stats-grid">
        <div className="quick-stat">
          <strong>₹{stats?.totalRevenue ?? 0}</strong>
          <span>Total Revenue (Paid Orders)</span>
        </div>
        <div className="quick-stat">
          <strong>{stats?.orderCount ?? 0}</strong>
          <span>Total Orders</span>
        </div>
        <div className="quick-stat">
          <strong>₹{orders.length ? Math.round(orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length) : 0}</strong>
          <span>Avg. Order Value</span>
        </div>
        <div className="quick-stat">
          <strong>{stats?.bookCount ?? 0}</strong>
          <span>Books Available</span>
        </div>
      </div>

      <h2>Revenue by Month</h2>
      {monthly.length === 0 ? (
        <p className="muted">No order data yet.</p>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, height: 220, padding: "20px 0" }}>
          {monthly.map(([label, val]) => (
            <div key={label} style={{ textAlign: "center", flex: 1 }}>
              <div
                style={{
                  height: `${Math.max(6, (val / maxVal) * 160)}px`,
                  background: "linear-gradient(180deg, #fbbf24, #f59e0b)",
                  borderRadius: "6px 6px 0 0",
                  marginBottom: 8,
                }}
                title={`₹${val}`}
              />
              <div className="muted" style={{ fontSize: "0.75rem" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>₹{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
