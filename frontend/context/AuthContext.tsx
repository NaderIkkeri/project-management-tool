"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// --- 1. DEFINE OUR NEW DATA TYPES ---
interface User {
  id: number;
  username: string;
  role: "ADMIN" | "MANAGER" | "DEVELOPER";
}

interface AuthTokens {
  access: string;
  refresh: string;
}

// This is what we'll store in state and localStorage
interface AuthState {
  tokens: AuthTokens;
  user: User;
}

// This is what the context will provide
interface AuthContextType {
  user: User | null; // User can be null if not logged in
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getAuthHeader: () => { Authorization: string };
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // --- 2. UPDATE STATE TO HOLD USER + TOKENS ---
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On component mount, try to load auth state from localStorage
  useEffect(() => {
    try {
      const storedState = localStorage.getItem("authState");
      if (storedState) {
        setAuthState(JSON.parse(storedState));
      }
    } catch (error) {
      console.error("Failed to parse authState from localStorage", error);
    }
    setLoading(false);
  }, []);

  // --- 3. UPDATE LOGIN FUNCTION ---
  const login = async (username: string, password: string) => {
    const res = await fetch("http://localhost:8000/api/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      throw new Error("Failed to login. Check username and password.");
    }

    const data = await res.json();

    // Create the new AuthState object
    const newAuthState: AuthState = {
      tokens: {
        access: data.access,
        refresh: data.refresh,
      },
      user: {
        id: data.id,
        username: data.username,
        role: data.role,
      },
    };

    setAuthState(newAuthState);
    localStorage.setItem("authState", JSON.stringify(newAuthState));
    router.push("/"); // Redirect to homepage on successful login
  };

  // --- 4. UPDATE LOGOUT FUNCTION ---
  const logout = () => {
    setAuthState(null);
    localStorage.removeItem("authState");
    router.push("/login"); // Redirect to login page
  };

  // --- 5. UPDATE GETAUTHEADER FUNCTION ---
  const getAuthHeader = () => {
    if (authState) {
      return { Authorization: `Bearer ${authState.tokens.access}` };
    }
    return { Authorization: "" };
  };

  // The value to be passed to consuming components
  const contextValue: AuthContextType = {
    user: authState ? authState.user : null, // Only expose the user
    login,
    logout,
    loading,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};