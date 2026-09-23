import { useState } from "react";
import { trackByNumber } from "../api/orders";
import { statusSlug } from "../utils/orderStatus";

export default function TrackOrder() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!trackingNumber.trim()) return;
    setLoading(true);
    try {
      const res = await trackByNumber(trackingNumber.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message || "No order found with this tracking number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1>Track Your Order</h1>
      <p className="muted">Enter the tracking number from your order confirmation or shipment update.</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. OB4F2A9C1D"
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <div className="form-error mt-30">{error}</div>}

      {result && (
        <div className="dashboard-panel mt-30">
          <div className="flex-between">
            <h3 className="mb-0">Tracking #{result.trackingNumber}</h3>
            <span className={`status status-${statusSlug(result.orderStatus)}`}>{result.orderStatus}</span>
          </div>
          {result.courier && <p className="muted">Courier: {result.courier}</p>}
          {result.estimatedDelivery && (
            <p className="muted">Estimated delivery: {new Date(result.estimatedDelivery).toLocaleDateString()}</p>
          )}

          {result.statusHistory?.length > 0 && (
            <ul className="tracking-timeline mt-30">
              {result.statusHistory.map((h, i) => (
                <li key={i}>
                  <div className="tt-status">{h.status}</div>
                  <div className="tt-meta">
                    {new Date(h.changedAt).toLocaleString()}
                    {h.location && ` — ${h.location}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
