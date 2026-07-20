import { Link, Route, Routes } from "react-router-dom";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import { ThemeToggle } from "./components/ThemeToggle";
import { useAuth } from "./authContext";

function SessionBar() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="session-info">
      <div className="user-chip">
        <div className="user-avatar">{initials}</div>
        <span className="user-name" style={{ fontSize: 13 }}>
          {currentUser.name}
        </span>
        <span className="role-chip">{currentUser.role}</span>
      </div>
      <button className="secondary" onClick={logout} style={{ padding: "6px 14px", fontSize: 13 }}>
        Sign out
      </button>
    </div>
  );
}

export function App() {
  return (
    <>
      <div className="topbar">
        <Link to="/" className="topbar-brand">
          <div className="brand-icon">🎫</div>
          <h1>Support Tickets</h1>
        </Link>
        <div className="topbar-right">
          <ThemeToggle />
          <SessionBar />
        </div>
      </div>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="container">
                <TicketsPage />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <RequireAuth>
              <div className="container">
                <TicketDetailPage />
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}
