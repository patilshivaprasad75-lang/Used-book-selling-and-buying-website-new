import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function BuyerLayout() {
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
          <NavLink to="/dashboard" end>
            <i className="fas fa-gauge" /> Overview
          </NavLink>
          <NavLink to="/dashboard/orders">
            <i className="fas fa-box" /> My Orders
          </NavLink>
          <NavLink to="/dashboard/wishlist">
            <i className="fas fa-heart" /> Wishlist
          </NavLink>
          <NavLink to="/dashboard/profile">
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
