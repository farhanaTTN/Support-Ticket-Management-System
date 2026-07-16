import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api/client";
import type { User } from "./types";

interface UserContextValue {
  users: User[];
  actingUser: User | null;
  setActingUser: (user: User | null) => void;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [actingUser, setActingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .listUsers()
      .then((data) => {
        if (!active) return;
        setUsers(data);
        setActingUser((current) => current ?? data[0] ?? null);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ users, actingUser, setActingUser, loading, error }),
    [users, actingUser, loading, error]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUsers must be used within a UserProvider");
  }
  return ctx;
}
