import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getBooks, CATEGORIES, CONDITIONS } from "../api/books";
import BookCard from "../components/BookCard";
import Loader, { EmptyState } from "../components/Loader";

export default function Books() {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.get("keyword") || "");

  const category = params.get("category") || "";
  const condition = params.get("condition") || "";
  const sortBy = params.get("sortBy") || "-createdAt";
  const page = Number(params.get("page") || 1);

  useEffect(() => {
    setKeyword(params.get("keyword") || "");
  }, [params]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await getBooks({
          keyword: params.get("keyword") || undefined,
          category: category || undefined,
          condition: condition || undefined,
          sortBy,
          page,
          limit: 12,
        });
        if (!cancelled) {
          setBooks(res.data || []);
          setMeta({ page: res.page || 1, pages: res.pages || 1, total: res.total || 0 });
        }
      } catch {
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next);
  };

  const goToPage = (p) => {
    const next = new URLSearchParams(params);
    next.set("page", p);
    setParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    updateParam("keyword", keyword.trim());
  };

  return (
    <section className="books-page">
      <h1>Browse Books</h1>

      <form className="book-search" onSubmit={submitSearch}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={category} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={condition} onChange={(e) => updateParam("condition", e.target.value)}>
          <option value="">Any Condition</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => updateParam("sortBy", e.target.value)}>
          <option value="-createdAt">Newest First</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-ratingAvg">Top Rated</option>
        </select>
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <Loader label="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon="fa-book-open"
          title="No books found"
          message="Try adjusting your search or filters, or check back soon for new listings."
        />
      ) : (
        <>
          <p className="muted" style={{ margin: "10px 0 20px" }}>
            Showing {books.length} of {meta.total} books
          </p>
          <div className="books-grid">
            {books.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>

          {meta.pages > 1 && (
            <div className="pagination">
              <button disabled={meta.page <= 1} onClick={() => goToPage(meta.page - 1)}>
                <i className="fas fa-chevron-left" />
              </button>
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={p === meta.page ? "active" : ""} onClick={() => goToPage(p)}>
                  {p}
                </button>
              ))}
              <button disabled={meta.page >= meta.pages} onClick={() => goToPage(meta.page + 1)}>
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
