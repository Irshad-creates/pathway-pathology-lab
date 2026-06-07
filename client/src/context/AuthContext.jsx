import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        const savedSessionId = localStorage.getItem("sessionId");

        if (savedToken && savedUser && savedSessionId) {
          // Verify token is still valid
          try {
            const response = await axios.get(`${API_BASE}/auth/verify`, {
              headers: {
                Authorization: `Bearer ${savedToken}`,
                "x-session-id": savedSessionId,
              },
            });

            if (response.status === 200) {
              setToken(savedToken);
              setUser(JSON.parse(savedUser));
              setSessionId(savedSessionId);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("sessionId");
            }
          } catch (error) {
            // Token verification failed, clear storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("sessionId");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token, sessionId, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("sessionId", sessionId);

    setToken(token);
    setUser(user);
    setSessionId(sessionId);
  };

  const logout = async () => {
    try {
      // Notify server of logout
      if (token) {
        await axios.post(
          `${API_BASE}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch (error) {
      // Logout error
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionId");
    setToken(null);
    setUser(null);
    setSessionId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        sessionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
