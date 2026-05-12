import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      navigate("/");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-text">Login</h1>
      <p className="mt-2 text-sm text-muted">Don't have an accunt?
        <Link to="/signup" className="text-brand-700 pl-2 hover:underline">Sign up</Link>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text">Email</label>
          <input
            id="login-email"
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
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={true}
            className="w-full rounded-input border border-border px-3 py-2 text-text placeholder:text-muted focus:border-brand-500"
          />
        </div>

        {error && (
          <p className="text-sm text-danger-600 text-center font-semibold">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </Button>
      </form>

    </main>
  )
}