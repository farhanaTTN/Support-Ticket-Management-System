import { Link, Route, Routes } from "react-router-dom";
import { TicketsPage } from "./pages/TicketsPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { UserProvider, useUsers } from "./userContext";

function ActingUserSelector() {
  const { users, actingUser, setActingUser } = useUsers();
  return (
    <div style={{ minWidth: 220 }}>
      <label htmlFor="acting-user">Acting as</label>
      <select
        id="acting-user"
        value={actingUser?.id ?? ""}
        onChange={(e) =>
          setActingUser(users.find((u) => u.id === e.target.value) ?? null)
        }
      >
        {users.length === 0 && <option value="">No users</option>}
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  );
}

export function App() {
  return (
    <UserProvider>
      <div className="topbar">
        <h1>
          <Link to="/">Support Ticket Management</Link>
        </h1>
        <ActingUserSelector />
      </div>
      <div className="container">
        <Routes>
          <Route path="/" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </div>
    </UserProvider>
  );
}
