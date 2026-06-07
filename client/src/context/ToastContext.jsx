import React, { createContext, useState, useCallback } from "react";

export const ToastContext = createContext();

let toastCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = `${Date.now()}-${++toastCounter}`;
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, duration = 3000) => addToast(message, "success", duration),
    [addToast],
  );

  const error = useCallback(
    (message, duration = 4000) => addToast(message, "error", duration),
    [addToast],
  );

  const info = useCallback(
    (message, duration = 3000) => addToast(message, "info", duration),
    [addToast],
  );

  const warning = useCallback(
    (message, duration = 3000) => addToast(message, "warning", duration),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, success, error, info, warning, toasts }}
    >
      {children}
    </ToastContext.Provider>
  );
};
