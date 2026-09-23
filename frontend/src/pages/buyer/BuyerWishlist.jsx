import { useEffect, useState } from "react";
import { getBookById } from "../../api/books";
import BookCard from "../../components/BookCard";
import Loader, { EmptyState } from "../../components/Loader";
import { Link } from "react-router-dom";

const WISHLIST_KEY = "ob_wishlist_v1";

export default function BuyerWishlist() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let ids = [];
      try {
        ids = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
      } catch {
        ids = [];
      }
      try {
        const results = await Promise.all(
          ids.map((id) => getBookById(id).then((r) => r.data).catch(() => null))
        );
        if (!cancelled) setBooks(results.filter(Boolean));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader label="Loading your wishlist..." />;

  return (
    <div className="dashboard-panel">
      <h1>My Wishlist</h1>
      {books.length === 0 ? (
        <EmptyState
          icon="fa-heart"
          title="Your wishlist is empty"
          message="Tap the heart icon on any book to save it here for later."
          action={
            <Link to="/books" className="btn btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
              Browse Books
            </Link>
          }
        />
      ) : (
        <div className="wishlist-grid">
          {books.map((b) => (
            <BookCard key={b._id} book={b} />
          ))}
        </div>
      )}
    </div>
  );
}
