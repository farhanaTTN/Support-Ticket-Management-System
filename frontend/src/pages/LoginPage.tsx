import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { ErrorBanner } from "../components/ErrorBanner";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../authContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"email" | "password", string>>
  >({});

  const from = (location.state as { from?: string })?.from ?? "/";

  function validate(): boolean {
    const errs: Partial<Record<"email" | "password", string>> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🎫</div>
          <h1>Support Tickets</h1>
          <p>Sign in to manage support requests</p>
        </div>

        <div className="card">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="grow">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email)
                      setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && (
                  <div className="field-error">⚠ {fieldErrors.email}</div>
                )}
              </div>
            </div>

            <div className="row" style={{ marginTop: 14 }}>
              <div className="grow">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  placeholder="Your password"
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && (
                  <div className="field-error">⚠ {fieldErrors.password}</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ width: "100%", padding: "11px", fontSize: 15 }}
              >
                {submitting ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Spinner size={16} />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <p
            className="muted"
            style={{ marginTop: 18, textAlign: "center", fontSize: 12 }}
          >
            Demo accounts — <strong>bob.agent@example.com</strong> (AGENT) or{" "}
            <strong>dave.requester@example.com</strong> (REQUESTER).{" "}
            Default password: <strong>Password123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
