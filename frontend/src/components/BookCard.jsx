import { Link } from "react-router-dom";
import { bookImageUrl } from "../api/books";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  const id = book._id || book.id;
  return (
    <div className="book-item">
      <Link to={`/books/${id}`}>
        <img src={bookImageUrl(book)} alt={book.title} loading="lazy" />
      </Link>
      <h3>
        <Link to={`/books/${id}`}>{book.title}</Link>
      </h3>
      <p className="book-author">by {book.author}</p>
      <span className="condition-badge">{book.condition}</span>
      <p className="price-row">
        <i className="fas fa-indian-rupee-sign" /> {book.price}
        {book.originalPrice > book.price && <s className="original-price">₹{book.originalPrice}</s>}
      </p>
      {book.ratingAvg > 0 && <StarRating value={book.ratingAvg} count={book.numReviews} size="0.85rem" />}
      <div className="book-btns">
        <Link to={`/books/${id}`} className="btn btn-primary btn-small">
          View Details
        </Link>
      </div>
    </div>
  );
}
