import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks, deleteBook, bookImageUrl } from "../../api/books";
import { useToast } from "../../context/ToastContext";
import Loader, { EmptyState } from "../../components/Loader";

export default function AdminManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const toast = useToast();

  const load = async (kw = "") => {
    setLoading(true);
    try {
      const res = await getBooks({ keyword: kw || undefined, limit: 100 });
      setBooks(res.data || []);
    } catch (err) {
      toast.error(err.message || "Could not load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(keyword);
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this book listing?")) return;
    try {
      await deleteBook(id);
      setBooks((b) => b.filter((x) => x._id !== id));
      toast.success("Book removed");
    } catch (err) {
      toast.error(err.message || "Could not remove book");
    }
  };

  return (
    <div className="dashboard-panel">
      <div className="flex-between">
        <h1 className="mb-0">Manage Books</h1>
        <Link to="/admin/add-book" className="btn btn-primary">
          <i className="fas fa-plus" /> Add Book
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-30" style={{ display: "flex", gap: 10, maxWidth: 400 }}>
        <input
          type="text"
          placeholder="Search books..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {loading ? (
        <Loader label="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState icon="fa-book" title="No books found" />
      ) : (
        <div className="table-wrap mt-30">
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>Seller</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
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
                  <td>{b.seller?.name || "—"}</td>
                  <td>{b.category}</td>
                  <td>₹{b.price}</td>
                  <td>
                    <span className={`status status-${b.status === "available" ? "delivered" : "pending"}`}>
                      {b.status}
                    </span>
                  </td>
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
