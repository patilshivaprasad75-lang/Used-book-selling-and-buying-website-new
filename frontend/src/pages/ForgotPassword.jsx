import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    // Note: the backend does not yet expose a password-reset endpoint.
    setSent(true);
    toast.info(`If an account exists for ${email}, a reset link would be sent there.`);
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <h1>Forgot Password</h1>
        <p>Enter your registered email below to reset your password.</p>
        {sent ? (
          <div className="form-success">
            This is a demo flow — password reset isn't wired up on the backend yet. Please contact support to
            reset your password for now.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              Send Reset Link
            </button>
          </form>
        )}
        <div className="login-links">
          <Link to="/login">Back to Login</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </section>
  );
}
