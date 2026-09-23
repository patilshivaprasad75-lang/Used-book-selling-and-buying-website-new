import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBooks, CATEGORIES } from "../api/books";
import Loader from "../components/Loader";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getBooks({ limit: 4, sortBy: "-createdAt" });
        if (!cancelled) setBooks(res.data || []);
      } catch {
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/books${keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : ""}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="section-tag">India's Student Book Marketplace</span>
          <h1>Buy & Sell Old Books Easily</h1>
          <p>Save Money, Reuse Books & Help Students Find Affordable Study Material.</p>
          <div className="hero-buttons">
            <Link to="/books" className="btn btn-primary">
              Explore Books
            </Link>
            <Link to="/sell-book" className="btn">
              Sell Your Books
            </Link>
          </div>
          <div className="hero-stats-inline">
            <div>
              <strong>500+</strong>
              <span>Books Listed</span>
            </div>
            <div>
              <strong>300+</strong>
              <span>Happy Students</span>
            </div>
            <div>
              <strong>150+</strong>
              <span>Books Sold</span>
            </div>
            <div>
              <strong>99%</strong>
              <span>Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      <section className="search-section">
        <h2>Search Books</h2>
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title, author or category"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="featured-books">
        <h2>Featured Books</h2>
        {loading ? (
          <Loader label="Fetching featured books..." />
        ) : books.length === 0 ? (
          <p className="text-center muted">
            No books available yet.{" "}
            <Link to="/sell-book">Be the first to list one!</Link>
          </p>
        ) : (
          <div className="book-container">
            {books.map((b) => (
              <FeaturedCard key={b._id} book={b} />
            ))}
          </div>
        )}
      </section>

      <section className="categories">
        <h2>Book Categories</h2>
        <div className="category-grid">
          {CATEGORIES.slice(0, 8).map((c) => (
            <Link key={c} to={`/books?category=${encodeURIComponent(c)}`} className="category-card">
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <h2>500+</h2>
          <p>Books Listed</p>
        </div>
        <div className="stat-card">
          <h2>300+</h2>
          <p>Happy Students</p>
        </div>
        <div className="stat-card">
          <h2>150+</h2>
          <p>Books Sold</p>
        </div>
        <div className="stat-card">
          <h2>99%</h2>
          <p>Satisfaction</p>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <i className="fas fa-user-plus" />
            <h3>Register</h3>
          </div>
          <div className="step">
            <i className="fas fa-book" />
            <h3>Find Book</h3>
          </div>
          <div className="step">
            <i className="fas fa-cart-plus" />
            <h3>Add To Cart</h3>
          </div>
          <div className="step">
            <i className="fas fa-credit-card" />
            <h3>Checkout</h3>
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturedCard({ book }) {
  const id = book._id;
  const img =
    book.images?.[0]?.url ||
    `https://via.placeholder.com/300x400/1e293b/f59e0b?text=${encodeURIComponent(book.title)}`;
  return (
    <div className="book-card">
      <img src={img} alt={book.title} loading="lazy" />
      <h3>{book.title}</h3>
      <p>
        <i className="fas fa-indian-rupee-sign" /> {book.price}
      </p>
      <Link to={`/books/${id}`}>
        <button>View Details</button>
      </Link>
    </div>
  );
}
