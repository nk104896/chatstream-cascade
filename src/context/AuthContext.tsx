import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/hooks/use-api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const api = useApi();
  const loginInProgress = useRef(false);

  // Check for existing session on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        
        if (token) {
          // Fetch current user data
          const userData = await api.get("/users/me");
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear invalid token
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [api]);

  const login = async (email: string, password: string) => {
    // Prevent multiple simultaneous login attempts
    if (loginInProgress.current) {
      console.log("Login already in progress, ignoring duplicate call");
      return;
    }
    
    loginInProgress.current = true;
    setIsLoading(true);
    
    try {
      // Make login API request
      const response = await api.post("/login", { email, password });
      
      // Save token
      localStorage.setItem("token", response.access_token);
      
      // Fetch user data
      const userData = await api.get("/users/me");
      setUser(userData);
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
      });
      throw error;
    } finally {
      setIsLoading(false);
      loginInProgress.current = false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Register user
      await api.post("/signup", { name, email, password });
      
      // Log in the newly registered user
      await login(email, password);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again later",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
