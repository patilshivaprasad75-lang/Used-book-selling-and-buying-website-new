import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyListings, deleteBook } from "../../api/books";
import { useToast } from "../../context/ToastContext";
import Loader, { EmptyState } from "../../components/Loader";
import { bookImageUrl } from "../../api/books";

export default function SellerListings() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const load = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getMyListings();
      setBooks(res.data || []);
    } catch (err) {
      if (!silent) toast.error(err.message || "Could not load your listings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // Stock/status changes whenever a buyer purchases one of your books, so
    // keep this screen fresh automatically instead of requiring a manual reload.
    const interval = setInterval(() => load({ silent: true }), 15000);
    const onFocus = () => load({ silent: true });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Remove this listing? This cannot be undone.")) return;
    try {
      await deleteBook(id);
      setBooks((b) => b.filter((x) => x._id !== id));
      toast.success("Listing removed");
    } catch (err) {
      toast.error(err.message || "Could not remove listing");
    }
  };

  if (loading) return <Loader label="Loading your listings..." />;

  return (
    <div className="dashboard-panel">
      <div className="flex-between">
        <h1 className="mb-0">My Listings</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-small" onClick={() => load({ silent: true })} disabled={refreshing} title="Refresh">
            <i className={`fas fa-rotate ${refreshing ? "fa-spin" : ""}`} /> Refresh
          </button>
          <Link to="/sell-book" className="btn btn-primary">
            <i className="fas fa-plus" /> Add New Book
          </Link>
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyState icon="fa-book" title="No listings yet" message="Start selling your old books today." />
      ) : (
        <div className="table-wrap mt-30">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Views</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((b) => (
                <tr key={b._id}>
                  <td>
                    <img src={bookImageUrl(b)} alt="" style={{ width: 34, height: 46, objectFit: "cover", borderRadius: 4 }} />
                  </td>
                  <td>
                    <Link to={`/books/${b._id}`}>{b.title}</Link>
                  </td>
                  <td>₹{b.price}</td>
                  <td>{b.stock}</td>
                  <td>
                    <span className={`status status-${b.status === "available" ? "delivered" : "pending"}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>{b.views}</td>
                  <td>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(b._id)}>
                      <i className="fas fa-trash" />
                    </button>
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
