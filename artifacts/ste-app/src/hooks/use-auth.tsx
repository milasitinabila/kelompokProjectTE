import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuthUser {
  username: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const USERS: Array<{ username: string; password: string; name: string; role: string }> = [
  { username: "admin", password: "admin123", name: "Administrator", role: "admin" },
  { username: "kasir", password: "kasir123", name: "Kasir Utama", role: "kasir" },
  { username: "teknisi", password: "teknisi123", name: "Teknisi Senior", role: "teknisi" },
];

const AUTH_KEY = "km_auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const found = USERS.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!found) return false;
    const authUser: AuthUser = { username: found.username, name: found.name, role: found.role };
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
