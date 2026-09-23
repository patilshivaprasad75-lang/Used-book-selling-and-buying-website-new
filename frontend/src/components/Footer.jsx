import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <h3>
          <i className="fas fa-book" /> Old Books Selling Management
        </h3>
        <p>Buy and Sell Used Books Easily.</p>
        <div className="footer-links">
          <Link to="/books">Browse Books</Link>
          <Link to="/sell-book">Sell a Book</Link>
          <Link to="/track-order">Track Order</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-social">
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook" /></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter" /></a>
        </div>
      </div>
      <p className="copyright">© {new Date().getFullYear()} OldBooks. All Rights Reserved.</p>
    </footer>
  );
}
