import { Fragment, useEffect, useState } from "react";
import { getSellerOrders, sellerActionOnItem, updateTracking } from "../../api/orders";
import { statusSlug } from "../../utils/orderStatus";
import { useToast } from "../../context/ToastContext";
import Loader, { EmptyState } from "../../components/Loader";

const SHIP_STAGES = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ status: "", location: "", note: "", courier: "" });
  const toast = useToast();

  const load = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getSellerOrders();
      setOrders(res.data || []);
    } catch (err) {
      if (!silent) toast.error(err.message || "Could not load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // A new order can arrive from a buyer at any time, so poll in the
    // background and refresh whenever the tab regains focus, rather than
    // only fetching once on mount.
    const interval = setInterval(() => load({ silent: true }), 15000);
    const onFocus = () => load({ silent: true });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (orderId, bookId, action) => {
    const note = window.prompt(`Optional note for this ${action}:`) || undefined;
    setBusy(`${orderId}-${bookId}`);
    try {
      await sellerActionOnItem(orderId, bookId, action, note);
      // Refetch so the seller-scoped item list and order status stay consistent.
      await load({ silent: true });
      toast.success(`Item ${action === "confirm" ? "confirmed" : "rejected"}`);
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const handleTrackingSubmit = async (orderId, e) => {
    e.preventDefault();
    setBusy(`tracking-${orderId}`);
    try {
      const payload = { ...trackingForm };
      if (!payload.status) delete payload.status;
      const res = await updateTracking(orderId, payload);
      setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, ...res.data, items: o.items } : o)));
      toast.success("Tracking updated");
      setTrackingForm({ status: "", location: "", note: "", courier: "" });
    } catch (err) {
      toast.error(err.message || "Could not update tracking");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <Loader label="Loading orders to fulfil..." />;

  if (orders.length === 0) {
    return (
      <div className="dashboard-panel">
        <EmptyState icon="fa-truck" title="No orders yet" message="Orders for your listed books will appear here." />
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="flex-between">
        <h1 className="mb-0">Orders To Fulfil</h1>
        <button className="btn btn-small" onClick={() => load({ silent: true })} disabled={refreshing} title="Refresh">
          <i className={`fas fa-rotate ${refreshing ? "fa-spin" : ""}`} /> Refresh
        </button>
      </div>
      <p className="muted">Confirm availability for each order. Once you (and any co-sellers) respond, it moves to admin for approval.</p>

      <div className="table-wrap mt-30">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>My Items</th>
              <th>Order Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <Fragment key={o._id}>
                <tr>
                  <td>#{o._id.slice(-6).toUpperCase()}</td>
                  <td>
                    {o.buyer?.name}
                    <br />
                    <span className="muted" style={{ fontSize: "0.78rem" }}>{o.buyer?.email}</span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.length}</td>
                  <td>
                    <span className={`status status-${statusSlug(o.orderStatus)}`}>{o.orderStatus}</span>
                  </td>
                  <td>
                    <button className="btn btn-small" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                      {expanded === o._id ? "Hide" : "Manage"}
                    </button>
                  </td>
                </tr>
                {expanded === o._id && (
                  <tr>
                    <td colSpan={6} className="order-detail-cell">
                      <div style={{ padding: "10px 0" }}>
                        <strong>Your items in this order</strong>
                        {o.items.map((it, i) => (
                          <div className="seller-item-row" key={i}>
                            <span>
                              {it.title} × {it.quantity} — ₹{it.price * it.quantity}{" "}
                              <span className={`status status-${statusSlug(it.sellerStatus)}`} style={{ marginLeft: 6 }}>
                                {it.sellerStatus}
                              </span>
                            </span>
                            {o.orderStatus === "Pending Confirmation" && it.sellerStatus === "Pending" && (
                              <span className="inline-actions">
                                <button
                                  className="btn btn-small btn-primary"
                                  disabled={busy === `${o._id}-${it.book}`}
                                  onClick={() => handleAction(o._id, it.book, "confirm")}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="btn btn-small btn-danger"
                                  disabled={busy === `${o._id}-${it.book}`}
                                  onClick={() => handleAction(o._id, it.book, "reject")}
                                >
                                  Reject
                                </button>
                              </span>
                            )}
                          </div>
                        ))}

                        <p className="muted" style={{ marginTop: 10 }}>
                          Shipping to: {o.shippingAddress?.city}, {o.shippingAddress?.state} - {o.shippingAddress?.pincode}
                        </p>

                        {["Admin Approved", "Processing", "Shipped", "Out for Delivery"].includes(o.orderStatus) && (
                          <>
                            <strong>Update Shipment Tracking</strong>
                            <form
                              onSubmit={(e) => handleTrackingSubmit(o._id, e)}
                              style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}
                            >
                              <select
                                value={trackingForm.status}
                                onChange={(e) => setTrackingForm((f) => ({ ...f, status: e.target.value }))}
                              >
                                <option value="">Keep current stage</option>
                                {SHIP_STAGES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <input
                                placeholder="Location (e.g. Mumbai hub)"
                                value={trackingForm.location}
                                onChange={(e) => setTrackingForm((f) => ({ ...f, location: e.target.value }))}
                              />
                              <input
                                placeholder="Courier (e.g. BlueDart)"
                                value={trackingForm.courier}
                                onChange={(e) => setTrackingForm((f) => ({ ...f, courier: e.target.value }))}
                              />
                              <input
                                placeholder="Note"
                                value={trackingForm.note}
                                onChange={(e) => setTrackingForm((f) => ({ ...f, note: e.target.value }))}
                              />
                              <button className="btn btn-small btn-primary" type="submit" disabled={busy === `tracking-${o._id}`}>
                                {busy === `tracking-${o._id}` ? "Saving..." : "Update"}
                              </button>
                            </form>
                          </>
                        )}

                        {o.statusHistory?.length > 0 && (
                          <>
                            <strong style={{ display: "block", marginTop: 12 }}>Timeline</strong>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
