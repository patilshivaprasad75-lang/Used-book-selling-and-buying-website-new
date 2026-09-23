import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      await updateProfile(payload);
      toast.success("Profile updated successfully");
      setForm((f) => ({ ...f, password: "" }));
    } catch (err) {
      setError(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <h1>Profile Settings</h1>
      <p className="muted">Update your personal information below.</p>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="input-group">
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input value={user?.email || ""} disabled />
          <p className="helper-text">Email address cannot be changed.</p>
        </div>
        <div className="input-group">
          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
