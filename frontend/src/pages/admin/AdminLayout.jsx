import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <section className="dashboard-section">
      <aside className="dashboard-sidebar">
        <div className="dashboard-user">
          <i className="fas fa-user-shield" />
          <h3>{user?.name}</h3>
          <span className="muted">{user?.email}</span>
          <span className="role-badge">admin</span>
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/admin" end>
            <i className="fas fa-gauge" /> Overview
          </NavLink>
          <NavLink to="/admin/books">
            <i className="fas fa-book" /> Manage Books
          </NavLink>
          <NavLink to="/admin/users">
            <i className="fas fa-users" /> Manage Users
          </NavLink>
          <NavLink to="/admin/orders">
            <i className="fas fa-shopping-cart" /> View Orders
          </NavLink>
          <NavLink to="/admin/revenue">
            <i className="fas fa-indian-rupee-sign" /> Revenue
          </NavLink>
          <NavLink to="/admin/add-book">
            <i className="fas fa-plus" /> Add Book
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
