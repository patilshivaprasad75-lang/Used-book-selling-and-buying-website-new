import { Fragment, useEffect, useState } from "react";
import { getMyOrders, cancelOrder } from "../../api/orders";
import { statusSlug, CANCELLABLE_STATUSES } from "../../utils/orderStatus";
import { useToast } from "../../context/ToastContext";
import Loader, { EmptyState } from "../../components/Loader";
import { Link } from "react-router-dom";

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const toast = useToast();

  const load = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this order? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      const reason = window.prompt("Reason for cancellation (optional):") || undefined;
      const res = await cancelOrder(id, reason);
      setOrders((os) => os.map((o) => (o._id === id ? res.data : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.message || "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loader label="Loading your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="dashboard-panel">
        <EmptyState
          icon="fa-box-open"
          title="No orders yet"
          message="Once you place an order, it will show up here."
          action={
            <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
              Browse Books
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <h1>My Orders</h1>
      <div className="table-wrap mt-30">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const canCancel = CANCELLABLE_STATUSES.includes(o.orderStatus);
              return (
                <Fragment key={o._id}>
                  <tr>
                    <td>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{o.items.length}</td>
                    <td>₹{o.totalAmount}</td>
                    <td>{o.paymentMethod}</td>
                    <td>
                      <span className={`status status-${statusSlug(o.orderStatus)}`}>{o.orderStatus}</span>
                    </td>
                    <td className="inline-actions">
                      <button className="btn btn-small" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                        {expanded === o._id ? "Hide" : "Track"}
                      </button>
                      {canCancel && (
                        <button
                          className="btn btn-small btn-danger"
                          disabled={cancellingId === o._id}
                          onClick={() => handleCancel(o._id)}
                        >
                          {cancellingId === o._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded === o._id && (
                    <tr>
                      <td colSpan={7} className="order-detail-cell">
                        <div style={{ padding: "10px 0" }}>
                          <strong>Items</strong>
                          <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                            {o.items.map((it, i) => (
                              <li key={i}>
                                {it.title} × {it.quantity} — ₹{it.price * it.quantity}{" "}
                                <span className={`status status-${statusSlug(it.sellerStatus)}`} style={{ marginLeft: 6 }}>
                                  seller: {it.sellerStatus}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <strong>Shipping To</strong>
                          <p className="muted">
                            {o.shippingAddress?.line1}, {o.shippingAddress?.line2 ? `${o.shippingAddress.line2}, ` : ""}
                            {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                          </p>

                          {o.trackingNumber && (
                            <p className="muted">
                              <strong>Tracking #:</strong> {o.trackingNumber}
                              {o.courier && <> via {o.courier}</>}
                              {o.estimatedDelivery && (
                                <> — Est. delivery {new Date(o.estimatedDelivery).toLocaleDateString()}</>
                              )}
                            </p>
                          )}

                          {o.statusHistory?.length > 0 && (
                            <>
                              <strong>Order Tracking</strong>
                              <ul className="tracking-timeline">
                                {o.statusHistory.map((h, i) => (
                                  <li key={i}>
                                    <div className="tt-status">{h.status}</div>
                                    <div className="tt-meta">
                                      {new Date(h.changedAt).toLocaleString()}
                                      {h.location && ` — ${h.location}`}
                                      {h.note && ` — ${h.note}`}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
