import { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socket";

const RealtimeContext = createContext();

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};

export const RealtimeProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    try {
      // Connect to socket when provider mounts
      const socket = socketService.connect();

      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("connect_error", (error) => {
        setIsConnected(false);
      });

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
      };
    } catch (error) {}
  }, []);

  const joinRoom = (room) => {
    switch (room) {
      case "patients":
        socketService.joinPatients();
        break;
      case "registrations":
        socketService.joinRegistrations();
        break;
      case "staff":
        socketService.joinStaff();
        break;
      case "reports":
        socketService.joinReports();
        break;
      default:
    }
  };

  const onUpdate = (eventType, callback) => {
    socketService.on(eventType, (data) => {
      setLastUpdate({ type: eventType, data, timestamp: new Date() });
      callback(data);
    });
  };

  const offUpdate = (eventType) => {
    socketService.off(eventType);
  };

  const value = {
    isConnected,
    lastUpdate,
    joinRoom,
    onUpdate,
    offUpdate,
    socketService,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
