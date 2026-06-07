import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/api";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        // Connection error occurred
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Room management
  joinReports() {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-reports");
    }
  }

  joinPatients() {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-patients");
    }
  }

  joinRegistrations() {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-registrations");
    }
  }

  joinStaff() {
    if (this.socket && this.isConnected) {
      this.socket.emit("join-staff");
    }
  }

  // Registration events
  onRegistrationCreated(callback) {
    if (this.socket) {
      this.socket.on("registration-created", callback);
    }
  }

  onRegistrationUpdated(callback) {
    if (this.socket) {
      this.socket.on("registration-updated", callback);
    }
  }

  offRegistrationCreated() {
    if (this.socket) {
      this.socket.off("registration-created");
    }
  }

  offRegistrationUpdated() {
    if (this.socket) {
      this.socket.off("registration-updated");
    }
  }

  // Patient events
  onPatientCreated(callback) {
    if (this.socket) {
      this.socket.on("patient-created", callback);
    }
  }

  onPatientUpdated(callback) {
    if (this.socket) {
      this.socket.on("patient-updated", callback);
    }
  }

  offPatientCreated() {
    if (this.socket) {
      this.socket.off("patient-created");
    }
  }

  offPatientUpdated() {
    if (this.socket) {
      this.socket.off("patient-updated");
    }
  }

  // Device request events - REMOVED

  // Staff events
  onStaffCreated(callback) {
    if (this.socket) {
      this.socket.on("staff-created", callback);
    }
  }

  onStaffUpdated(callback) {
    if (this.socket) {
      this.socket.on("staff-updated", callback);
    }
  }

  offStaffCreated() {
    if (this.socket) {
      this.socket.off("staff-created");
    }
  }

  offStaffUpdated() {
    if (this.socket) {
      this.socket.off("staff-updated");
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
