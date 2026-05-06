import { createContext, useContext, useState, useEffect } from "react";

const DEFAULT_USERS = [
  { username: "admin", password: "admin123", name: "Administrator", role: "admin", customerId: null },
  { username: "pelanggan", password: "pelanggan123", name: "Budi Santoso", role: "pelanggan", customerId: 1 },
];

const AUTH_KEY = "km_auth_user";
const REGISTERED_KEY = "km_registered_users";

const AuthContext = createContext(null);

const getRegisteredUsers = () => {
  try {
    const stored = localStorage.getItem(REGISTERED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(AUTH_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const allUsers = [...DEFAULT_USERS, ...getRegisteredUsers()];
    const found = allUsers.find(
      (u) => u.username === username.trim().toLowerCase() && u.password === password
    );
    if (!found) return false;
    const authUser = {
      username: found.username,
      name: found.name,
      role: found.role,
      customerId: found.customerId ?? null,
    };
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return true;
  };

  const register = ({ username, password, name, customerId }) => {
    const registered = getRegisteredUsers();
    const allUsers = [...DEFAULT_USERS, ...registered];
    if (allUsers.some((u) => u.username === username.toLowerCase())) {
      return { success: false, error: "Username sudah digunakan." };
    }
    const newUser = {
      username: username.trim().toLowerCase(),
      password,
      name,
      role: "pelanggan",
      customerId: customerId ?? null,
    };
    registered.push(newUser);
    localStorage.setItem(REGISTERED_KEY, JSON.stringify(registered));

    const authUser = { username: newUser.username, name: newUser.name, role: "pelanggan", customerId: newUser.customerId };
    setUser(authUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAdmin: user?.role === "admin",
      isPelanggan: user?.role === "pelanggan",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
