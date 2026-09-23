import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookById, getBookReviews, addReview } from "../api/books";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader";
import StarRating from "../components/StarRating";

const WISHLIST_KEY = "ob_wishlist_v1";

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
}
function setWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const { isAuthenticated, user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [bookRes, reviewRes] = await Promise.all([getBookById(id), getBookReviews(id).catch(() => ({ data: [] }))]);
        if (!cancelled) {
          setBook(bookRes.data);
          setReviews(reviewRes.data || []);
          setInWishlist(getWishlist().includes(id));
        }
      } catch (err) {
        if (!cancelled) toast.error(err.message || "Failed to load book");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please login to add items to your cart");
      navigate("/login", { state: { from: { pathname: `/books/${id}` } } });
      return;
    }
    setAdding(true);
    try {
      await add(id, 1);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (isAuthenticated) navigate("/cart");
  };

  const toggleWishlist = () => {
    const list = getWishlist();
    let next;
    if (list.includes(id)) {
      next = list.filter((x) => x !== id);
      toast.info("Removed from wishlist");
    } else {
      next = [...list, id];
      toast.success("Added to wishlist");
    }
    setWishlist(next);
    setInWishlist(!inWishlist);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/books/${id}` } } });
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview(id, reviewForm);
      const reviewRes = await getBookReviews(id);
      setReviews(reviewRes.data || []);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted");
    } catch (err) {
      setReviewError(err.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader label="Loading book details..." />;
  if (!book)
    return (
      <div className="page-wrap text-center">
        <h2>Book not found</h2>
        <Link to="/books" className="btn btn-primary" style={{ marginTop: 20, display: "inline-block" }}>
          Back to Books
        </Link>
      </div>
    );

  const images = book.images?.length
    ? book.images
    : [{ url: `https://via.placeholder.com/400x520/1e293b/f59e0b?text=${encodeURIComponent(book.title)}` }];

  const alreadyOwn = book.seller && user && (book.seller._id === user._id || book.seller === user._id);

  return (
    <section className="details-section">
      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/books">Books</Link> / <span>{book.title}</span>
      </nav>

      <div className="details-container">
        <div className="book-images">
          <div className="book-image book-image-front" data-label="Cover">
            <img src={images[activeImg]?.url} alt={book.title} />
          </div>
        </div>

        <div className="book-info">
          <h1>{book.title}</h1>
          <p className="muted">by {book.author}</p>
          {book.ratingAvg > 0 && (
            <StarRating value={book.ratingAvg} count={book.numReviews} size="1.1rem" />
          )}

          {images.length > 1 && (
            <div className="book-thumb-row">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  className={i === activeImg ? "active-thumb" : ""}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}

          <p className="price">
            <i className="fas fa-indian-rupee-sign" /> {book.price}
            {book.originalPrice > book.price && (
              <s style={{ marginLeft: 10, fontSize: "0.7em", opacity: 0.6 }}>₹{book.originalPrice}</s>
            )}
          </p>

          <div className="condition">{book.condition} Condition</div>

          <p className="description">{book.description}</p>

          <div className="chip-row">
            <span className="chip active">{book.category}</span>
            {book.language && <span className="chip">{book.language}</span>}
            {book.edition && <span className="chip">Edition: {book.edition}</span>}
            {book.stock > 0 ? (
              <span className="chip">{book.stock} in stock</span>
            ) : (
              <span className="chip">Out of stock</span>
            )}
          </div>

          {book.seller && (
            <div className="seller-info">
              <h3>Seller Details</h3>
              <p>Name: {book.seller.name}</p>
              {book.seller.sellerProfile?.shopName && <p>Shop: {book.seller.sellerProfile.shopName}</p>}
              {book.seller.email && <p>Email: {book.seller.email}</p>}
            </div>
          )}

          <div className="detail-buttons">
            <button
              id="addCartBtn"
              onClick={handleAddToCart}
              disabled={adding || book.status !== "available" || alreadyOwn}
            >
              {adding ? "Adding..." : "Add To Cart"}
            </button>
            <button id="buyBtn" onClick={handleBuyNow} disabled={book.status !== "available" || alreadyOwn}>
              Buy Now
            </button>
            <button id="wishlistBtn" onClick={toggleWishlist}>
              <i className={`fas fa-heart`} style={{ color: inWishlist ? "#ef4444" : undefined }} />{" "}
              {inWishlist ? "Wishlisted" : "Wishlist"}
            </button>
          </div>
          {book.status !== "available" && <p className="small-note">This book is currently {book.status}.</p>}
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
        {reviews.length === 0 ? (
          <p className="muted">No reviews yet. Be the first to review this book.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="review-item">
              <div className="review-item-head">
                <strong>{r.user?.name || "Anonymous"}</strong>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <StarRating value={r.rating} size="0.9rem" />
              {r.comment && <p style={{ marginTop: 8 }}>{r.comment}</p>}
            </div>
          ))
        )}

        <form className="review-form" onSubmit={submitReview}>
          <h3>Write a Review</h3>
          {reviewError && <div className="form-error">{reviewError}</div>}
          <div className="input-group">
            <label>Your Rating</label>
            <StarRating
              value={reviewForm.rating}
              interactive
              size="1.4rem"
              onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
            />
          </div>
          <div className="input-group">
            <label>Comment</label>
            <textarea
              rows={4}
              placeholder="Share your thoughts about this book..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submittingReview}>
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </section>
  );
}
