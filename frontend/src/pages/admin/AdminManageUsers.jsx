import { useEffect, useState } from "react";
import { getAllUsers, toggleBlockUser } from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error(err.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleBlock = async (id) => {
    try {
      const res = await toggleBlockUser(id);
      setUsers((u) => u.map((x) => (x._id === id ? res.data : x)));
      toast.success(res.data.isBlocked ? "User blocked" : "User unblocked");
    } catch (err) {
      toast.error(err.message || "Could not update user");
    }
  };

  if (loading) return <Loader label="Loading users..." />;

  return (
    <div className="dashboard-panel">
      <h1>Manage Users</h1>
      <p className="muted">{users.length} registered users</p>

      <div className="table-wrap mt-30">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${u.isBlocked ? "status-cancelled" : "status-delivered"}`}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>
                  {u.role !== "admin" && (
                    <button
                      className={`btn btn-small ${u.isBlocked ? "" : "btn-danger"}`}
                      onClick={() => handleToggleBlock(u._id)}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
