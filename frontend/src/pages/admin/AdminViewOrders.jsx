import { Fragment, useEffect, useState } from "react";

import { getAllOrders, adminApproveOrder, updateTracking } from "../../api/orders";

import { getAllOrders, adminApproveOrder } from "../../api/orders";
import { statusSlug } from "../../utils/orderStatus";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";

const FILTERS = [
  "All",
  "Pending Confirmation",
  "Seller Confirmed",
  "Admin Approved",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Rejected",
  "Returned",
];

export default function AdminViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);

  const [trackingForm, setTrackingForm] = useState({ status: "", location: "", note: "", courier: "" });

  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders(filter === "All" ? undefined : filter);
      setOrders(res.data || []);
    } catch (err) {
      toast.error(err.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApproval = async (id, action) => {
    const note = window.prompt(`Optional note for this ${action}:`) || undefined;
    setBusy(id);
    try {
      const res = await adminApproveOrder(id, action, note);
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, ...res.data } : o)));
      toast.success(`Order ${action === "approve" ? "approved" : "rejected"}`);
    } catch (err) {
      toast.error(err.message || "Could not update order");
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
      setOrders((os) => os.map((o) => (o._id === orderId ? { ...o, ...res.data } : o)));
      toast.success("Order status updated");
      setTrackingForm({ status: "", location: "", note: "", courier: "" });
    } catch (err) {
      toast.error(err.message || "Could not update order status");
    } finally {
      setBusy(null);
    }
  };


  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div className="dashboard-panel">
      <div className="flex-between">
        <h1 className="mb-0">All Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {FILTERS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <p className="muted">{orders.length} orders</p>

      <div className="table-wrap mt-30">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Seller Status</th>
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
                  <td>₹{o.totalAmount}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    <span className={`status status-${statusSlug(o.sellerConfirmation?.status || "pending")}`}>
                      {o.sellerConfirmation?.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status status-${statusSlug(o.orderStatus)}`}>{o.orderStatus}</span>
                  </td>
                  <td className="inline-actions">
                    <button className="btn btn-small" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                      {expanded === o._id ? "Hide" : "Details"}
                    </button>
                    {o.orderStatus === "Seller Confirmed" && (
                      <>
                        <button
                          className="btn btn-small btn-primary"
                          disabled={busy === o._id}
                          onClick={() => handleApproval(o._id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          disabled={busy === o._id}
                          onClick={() => handleApproval(o._id, "reject")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                {expanded === o._id && (
                  <tr>
                    <td colSpan={9} className="order-detail-cell">
                      <div style={{ padding: "10px 0" }}>
                        <strong>Items</strong>
                        <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                          {o.items.map((it, i) => (
                            <li key={i}>
                              {it.title} × {it.quantity} — ₹{it.price * it.quantity}{" "}
                              <span className={`status status-${statusSlug(it.sellerStatus)}`} style={{ marginLeft: 6 }}>
                                {it.sellerStatus}
                              </span>
                              {it.sellerNote && <span className="muted"> — "{it.sellerNote}"</span>}
                            </li>
                          ))}
                        </ul>

                        {o.trackingNumber && (
                          <p className="muted">
                            <strong>Tracking #:</strong> {o.trackingNumber}
                            {o.courier && <> via {o.courier}</>}
                          </p>
                        )}


                        {TRACKABLE_STATUSES.includes(o.orderStatus) && (
                          <>
                            <strong>Update Order Status</strong>
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
                            <strong>Timeline</strong>
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
