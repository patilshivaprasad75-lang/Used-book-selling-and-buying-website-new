// Converts an order status like "Pending Confirmation" into a CSS-safe
// class suffix like "pending-confirmation" so styles/enhancements.css can
// target every status with a predictable `status-<slug>` class name.
export function statusSlug(status = "") {
  return status
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const CANCELLABLE_STATUSES = ["Pending Confirmation", "Seller Confirmed", "Admin Approved", "Processing"];
