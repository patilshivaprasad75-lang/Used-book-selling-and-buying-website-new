import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBook, CATEGORIES, CONDITIONS } from "../../api/books";
import { useToast } from "../../context/ToastContext";

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

export default function AdminAddBook() {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    if (Number(form.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await createBook({ ...form, originalPrice: form.originalPrice || undefined }, images);
      toast.success("Book listed successfully!");
      navigate(`/admin/books`);
      void res;
    } catch (err) {
      setError(err.message || "Could not create the listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <h1>Add New Book</h1>
      <p className="muted">List a book on behalf of the platform.</p>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 700 }}>
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
          {previews.length > 0 && (
            <div className="file-input-preview">
              {previews.map((src, i) => (
                <img key={i} src={src} alt="" />
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Listing..." : "List Book"}
        </button>
      </form>
    </div>
  );
}
