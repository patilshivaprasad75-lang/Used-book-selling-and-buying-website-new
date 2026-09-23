import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook, CATEGORIES, CONDITIONS } from "../api/books";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialForm = {
  title: "",
  author: "",
  isbn: "",
  description: "",
  category: "Academic",
  condition: "Good",
  language: "English",
  edition: "",
  originalPrice: "",
  price: "",
  stock: 1,
};

export default function SellBook() {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, isSeller } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/sell-book" } } });
      return;
    }
    if (!isSeller) {
      setError("Only seller accounts can list books. Update your role from Settings, or register as a seller.");
      return;
    }
    if (Number(form.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBook(
        {
          ...form,
          originalPrice: form.originalPrice || undefined,
        },
        images
      );
      toast.success("Your book has been listed!");
      navigate(`/books/${res.data._id}`);
    } catch (err) {
      setError(err.message || "Could not list your book. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="sell-book-section">
      <div className="sell-book-container">
        <span className="section-tag">List Your Book</span>
        <h1>Sell Your Old Book</h1>
        <p className="muted">Fill in the details below to list your book on OldBooks marketplace.</p>

        {!isAuthenticated && (
          <div className="form-error">
            You need to be logged in as a seller to list a book. <a href="/login">Login</a> or{" "}
            <a href="/register">create a seller account</a>.
          </div>
        )}
        {isAuthenticated && !isSeller && (
          <div className="form-error">
            Your account is registered as a buyer. Only seller accounts can list books for sale.
          </div>
        )}
        {error && <div className="form-error">{error}</div>}

        <form   onSubmit={handleSubmit}>
          <div className="input-row">
            <div className="input-group">
              <label>Book Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Author *</label>
              <input name="author" value={form.author} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>ISBN</label>
              <input name="isbn" value={form.isbn} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Edition</label>
              <input name="edition" value={form.edition} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Language</label>
              <input name="language" value={form.language} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Description *</label>
            <textarea rows={4} name="description" value={form.description} onChange={handleChange} required />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} required>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Original Price (₹)</label>
              <input type="number" min="0" name="originalPrice" value={form.originalPrice} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Selling Price (₹) *</label>
              <input type="number" min="1" name="price" value={form.price} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Stock</label>
              <input type="number" min="0" name="stock" value={form.stock} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label>Book Images (up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleFiles} />
            <p className="helper-text">Clear photos of the cover and condition help your book sell faster.</p>
            {previews.length > 0 && (
              <div className="file-input-preview">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? "Listing your book..." : "List Book For Sale"}
          </button>
        </form>
      </div>
    </section>
  );
}
