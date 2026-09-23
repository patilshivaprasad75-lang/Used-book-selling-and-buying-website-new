import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const toast = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // No dedicated backend endpoint for contact messages yet — simulate submission.
    setTimeout(() => {
      setSending(false);
      toast.success("Thanks for reaching out! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    }, 700);
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-info">
          <span className="section-tag">Get In Touch</span>
          <h1>Contact Us</h1>
          <p>Have a question, feedback, or a partnership idea? We'd love to hear from you.</p>
          <ul className="contact-details" style={{ listStyle: "none", padding: 0 }}>
            <li className="contact-item">
              <i className="fas fa-envelope" /> patilshivaprasad@gmail.com
            </li>
            <li className="contact-item">
              <i className="fas fa-phone" /> +91 8177947703
            </li>
            <li className="contact-item">
              <i className="fas fa-location-dot" /> Akkalkot, Maharashtra, India
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send a Message</h2>
          <div className="input-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea rows={5} name="message" value={form.message} onChange={handleChange} required />
          </div>
          <button type="submit" className="contact-btn" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
