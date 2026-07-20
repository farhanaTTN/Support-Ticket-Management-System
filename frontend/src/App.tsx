import { Link, Route, Routes } from "react-router-dom";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import { useAuth } from "./authContext";

function SessionBar() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;
  return (
    <div className="row" style={{ alignItems: "center" }}>
      <span className="muted">
        {currentUser.name} ({currentUser.role})
      </span>
      <button className="secondary" onClick={logout}>
        Sign out
      </button>
    </div>
  );
}

export function App() {
  return (
    <>
      <div className="topbar">
        <h1>
          <Link to="/">Support Ticket Management</Link>
        </h1>
        <SessionBar />
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
