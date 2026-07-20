import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  ApiError,
  getToken,
  setToken,
  setUnauthorizedHandler,
} from "./api/client";
import type { User } from "./types";

interface AuthContextValue {
  currentUser: User | null;
  users: User[];
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    setUsers([]);
  }, []);

  // Any 401 from the API clears the session.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Loads the signed-in user and the user list used for assignee selection.
  const loadSession = useCallback(async () => {
    const [me, allUsers] = await Promise.all([api.me(), api.listUsers()]);
    setCurrentUser(me);
    setUsers(allUsers);
  }, []);

  // Restore an existing session on first load (validates the stored token).
  useEffect(() => {
    let active = true;
    (async () => {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        await loadSession();
      } catch {
        if (active) logout();
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadSession, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await api.login(email, password);
        setToken(result.token);
        await loadSession();
      } catch (err) {
        setToken(null);
        throw err instanceof ApiError
          ? err
          : new ApiError(0, "Login failed");
      }
    },
    [loadSession]
  );

  const value = useMemo(
    () => ({ currentUser, users, initializing, login, logout }),
    [currentUser, users, initializing, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
