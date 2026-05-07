import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const ROLE_OPTIONS = [
  { value: "User", label: "User" },
  { value: "Admin", label: "Admin" }
]


export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("User");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function validatePassword() {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (!validatePassword()) return;
      const response = await register(email, password, role);
      if ("error" in response) {
        setError(response.error);
        return;
      }
      navigate("/login", {
        replace: false,
        state: {
          registered: true,
          email: email.trim()
        }
      })
    } finally {
      setSubmitting(false);
    }

  }
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-text">Sign Up</h1>
      <p className="mt-2 text-sm text-muted">Already have an accunt?
        <Link to="/login" className="text-brand-700 hover:underline">Login</Link>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            required={true}
            className="w-full rounded-input border border-border px-3 py-2 text-text placeholder:text-muted focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value.trim())}
            required={true}
            className="w-full rounded-input border border-border px-3 py-2 text-text placeholder:text-muted focus:border-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text">Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            autoComplete="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value.trim())}
            required={true}
            className="w-full rounded-input border border-border px-3 py-2 text-text placeholder:text-muted focus:border-brand-500"
          />
        </div>

        <div>
          <label htmlFor="signup-role" className="block text-sm font-medium text-text">
            Rol
          </label>
          <select
            id="signup-role"
            value={role}
            onChange={(ev) => setRole(ev.target.value)}
            className="mt-1 w-full rounded-input border border-border bg-surface px-3 py-2 text-sm text-text shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-sm text-danger-600 text-center font-semibold">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing up..." : "Sign up"}
        </Button>
      </form>

    </main>
  )
}