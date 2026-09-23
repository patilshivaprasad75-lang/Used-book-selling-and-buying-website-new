import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SellerLayout() {
  const { user, logout } = useAuth();

  return (
    <section className="dashboard-section">
      <aside className="dashboard-sidebar">
        <div className="dashboard-user">
          <i className="fas fa-user-circle" />
          <h3>{user?.name}</h3>
          <span className="muted">{user?.email}</span>
          <span className="role-badge">{user?.role}</span>
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/seller" end>
            <i className="fas fa-gauge" /> Overview
          </NavLink>
          <NavLink to="/seller/listings">
            <i className="fas fa-book" /> My Listings
          </NavLink>
          <NavLink to="/seller/orders">
            <i className="fas fa-truck" /> Orders To Fulfil
          </NavLink>
          <NavLink to="/seller/profile">
            <i className="fas fa-user-pen" /> Profile Settings
          </NavLink>
          <button className="dashboard-logout" onClick={logout}>
            <i className="fas fa-right-from-bracket" /> Logout
          </button>
        </nav>
      </aside>
      <div className="dashboard-content">
        <Outlet />
      </div>
    </section>
  );
}
