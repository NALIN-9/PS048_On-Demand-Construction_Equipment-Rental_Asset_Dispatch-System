import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("buildasset_token");
    const savedUser = localStorage.getItem("buildasset_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("buildasset_token");
        localStorage.removeItem("buildasset_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post("/api/auth/login", {
        username,
        password,
      });

      const { token: jwtToken, userId, email, fullName, role } = response.data;
      const userData = {
        userId,
        username: response.data.username || username,
        email,
        fullName,
        role,
      };

      localStorage.setItem("buildasset_token", jwtToken);
      localStorage.setItem("buildasset_user", JSON.stringify(userData));

      setToken(jwtToken);
      setUser(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Authentication failed. Please check credentials.";
      return { success: false, error: message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await axiosClient.post("/api/auth/register", formData);
      return { success: true, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please check your inputs.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("buildasset_token");
    localStorage.removeItem("buildasset_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
