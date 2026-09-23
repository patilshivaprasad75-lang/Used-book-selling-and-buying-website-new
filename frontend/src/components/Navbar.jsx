import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { isAuthenticated, user, logout, dashboardPath } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header>
      <nav className="navbar">
        <Link to="/" className="logo">
          <i className="fas fa-book" /> OldBooks
        </Link>

        <ul className={`nav-links ${open ? "nav-links-open" : ""}`}>
          <li>
            <NavLink to="/" end onClick={() => setOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/books" onClick={() => setOpen(false)}>
              Books
            </NavLink>
          </li>
          <li>
            <NavLink to="/sell-book" onClick={() => setOpen(false)}>
              Sell Book
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={() => setOpen(false)}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" onClick={() => setOpen(false)}>
              Contact
            </NavLink>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-links-mobile-only">
                <NavLink to={dashboardPath} onClick={() => setOpen(false)}>
                  <i className="fas fa-user-circle" /> {user?.name?.split(" ")[0]}
                </NavLink>
              </li>
              <li className="nav-links-mobile-only">
                <button className="mobile-logout-link" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-links-mobile-only">
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li className="nav-links-mobile-only">
                <NavLink to="/register" onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="nav-buttons">
          <Link to="/cart" className="btn cart-icon-btn" title="Cart">
            <i className="fas fa-shopping-cart" />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <div className="nav-buttons-desktop">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath} className="btn nav-user-btn">
                  <i className="fas fa-user-circle" /> {user?.name?.split(" ")[0]}
                </Link>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <i className={`fas ${open ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </nav>
    </header>
  );
}
