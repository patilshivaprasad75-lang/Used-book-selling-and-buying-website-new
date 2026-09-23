import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-wrap text-center">
      <h1 style={{ fontSize: "4rem" }}>404</h1>
      <h2>Page Not Found</h2>
      <p className="muted">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: "inline-block" }}>
        Back to Home
      </Link>
    </section>
  );
}
