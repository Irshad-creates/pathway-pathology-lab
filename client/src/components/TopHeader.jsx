import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Bell,
  Wallet,
  LogOut,
  X,
  Phone,
  Calendar,
  ArrowRight,
  Lock,
  Settings,
  ChevronDown,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useRealtime } from "../context/RealtimeContext";
import {
  registrationAPI,
  settingsAPI,
  patientAPI,
  patientPortalAPI,
} from "../services/api";

export default function TopHeader({ hideSearch = false, hideWallet = false }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { joinRoom, onUpdate, isConnected } = useRealtime();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  // Enhanced search states
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const searchInputRef = useRef();
  const searchSuggestionsRef = useRef();

  // Dynamic data states
  const [paymentSummary, setPaymentSummary] = useState({
    totalRegistrations: 0,
    cashCollected: 0,
    upiReceived: 0,
    pending: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [labSettings, setLabSettings] = useState(() => {
    // Initialize from localStorage to avoid flash
    try {
      const cached = localStorage.getItem("labSettings");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Load data on mount
  useEffect(() => {
    loadLabSettings();
    loadPaymentSummary();
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadPaymentSummary();
      loadNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time notifications via Socket.io
  useEffect(() => {
    if (!isConnected) return;

    // Join appropriate room
    if (user?.role === "patient") {
      joinRoom("patients");
    } else {
      joinRoom("registrations");
    }

    // Listen for registration updates
    onUpdate("registration-updated", (data) => {
      loadNotifications();
    });

    // Listen for registration created
    onUpdate("registration-created", (data) => {
      loadNotifications();
    });

    // Listen for payment updates
    onUpdate("payment-received", (data) => {
      loadNotifications();
      loadPaymentSummary();
    });

    return () => {
      // Cleanup listeners
    };
  }, [isConnected, user?.role]);

  // Enhanced search functionality
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchSuggestions([]);
        setShowSearchSuggestions(false);
        return;
      }

      setSearchLoading(true);
      try {
        const res = await patientAPI.getSuggestions(searchQuery);
        setSearchSuggestions(res.data);
        setShowSearchSuggestions(res.data.length > 0);
        setSelectedSearchIndex(-1);
      } catch (error) {
        setSearchSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadLabSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setLabSettings(res.data);
      // Cache in localStorage for persistence across navigation
      localStorage.setItem("labSettings", JSON.stringify(res.data));
    } catch (error) {
      // Use cached settings if API fails
    }
  };

  const loadPaymentSummary = async () => {
    try {
      const res = await registrationAPI.search({});
      const registrations = res.data || [];

      // Filter registrations that have payments (same logic as Search component)
      const paidRegistrations = registrations.filter((reg) => {
        return (
          reg.paidAmount > 0 ||
          (reg.totalAmount > 0 && reg.status === "Completed") ||
          (reg.totalAmount > 0 &&
            reg.paymentMethod &&
            reg.paymentMethod !== "Send to WhatsApp (Pending)")
        );
      });

      // Calculate cash and UPI amounts using same logic as Search component
      const cashPayments = paidRegistrations.filter(
        (reg) => reg.paymentMethod === "Cash",
      );
      const upiPayments = paidRegistrations.filter(
        (reg) => reg.paymentMethod === "UPI",
      );

      const cashCollected = cashPayments.reduce((sum, reg) => {
        // For cash payments, use paidAmount if available, otherwise use totalAmount for completed
        if (
          reg.status === "Completed" &&
          (!reg.paidAmount || reg.paidAmount === 0)
        ) {
          return sum + (reg.totalAmount || 0);
        }
        return sum + (reg.paidAmount || 0);
      }, 0);

      const upiReceived = upiPayments.reduce((sum, reg) => {
        // For UPI payments, use paidAmount if available, otherwise use totalAmount for completed
        if (
          reg.status === "Completed" &&
          (!reg.paidAmount || reg.paidAmount === 0)
        ) {
          return sum + (reg.totalAmount || 0);
        }
        return sum + (reg.paidAmount || 0);
      }, 0);

      // Calculate pending amount
      const pending = registrations
        .filter(
          (reg) =>
            reg.paymentMethod === "Send to WhatsApp (Pending)" ||
            reg.status === "Pending",
        )
        .reduce((sum, reg) => sum + (reg.totalAmount || 0), 0);

      setPaymentSummary({
        totalRegistrations: paidRegistrations.length, // Count only registrations with payments
        cashCollected,
        upiReceived,
        pending,
      });
    } catch (error) {}
  };

  const loadNotifications = async () => {
    try {
      // Get all registrations
      const res = await registrationAPI.search({});
      const allRegistrations = res.data || [];

      // Get read notifications from localStorage
      const readNotifications = JSON.parse(
        localStorage.getItem("readNotifications") || "[]",
      );

      const notifs = [];

      // For patients - show their own registrations
      if (user?.role === "patient") {
        const patientRegs = allRegistrations.filter(
          (reg) =>
            reg.patient?.name === user?.name ||
            reg.patient?.mobile === user?.mobile,
        );

        patientRegs.forEach((reg) => {
          const isRead = readNotifications.includes(reg._id);

          if (reg.status === "Registration") {
            notifs.push({
              id: reg._id,
              type: "registration",
              title: "Registration Confirmed",
              message: `Your registration (${reg.labCode}) confirmed. ₹${reg.netAmount || reg.totalAmount}`,
              color: "blue",
              read: isRead,
            });
          } else if (reg.status === "Sample Pending") {
            const balance =
              (reg.netAmount || reg.totalAmount) - (reg.paidAmount || 0);
            if (balance > 0) {
              notifs.push({
                id: reg._id,
                type: "payment_pending",
                title: "Payment Pending",
                message: `Please pay ₹${balance.toFixed(2)} for ${reg.labCode}`,
                color: "orange",
                read: isRead,
              });
            } else {
              notifs.push({
                id: reg._id,
                type: "payment_received",
                title: "Payment Received",
                message: `Payment of ₹${reg.paidAmount || reg.netAmount || reg.totalAmount} received`,
                color: "green",
                read: isRead,
              });
            }
          } else if (reg.status === "Sample Collected") {
            notifs.push({
              id: reg._id,
              type: "sample_collected",
              title: "Sample Collected",
              message: `Your sample (${reg.labCode}) has been collected`,
              color: "orange",
              read: isRead,
            });
          } else if (reg.status === "Processing") {
            notifs.push({
              id: reg._id,
              type: "processing",
              title: "Processing",
              message: `Your tests (${reg.labCode}) are being processed`,
              color: "blue",
              read: isRead,
            });
          } else if (reg.status === "Report Ready") {
            notifs.push({
              id: reg._id,
              type: "report_ready",
              title: "Report Ready",
              message: `Your test report (${reg.labCode}) is ready`,
              color: "green",
              read: isRead,
            });
          } else if (reg.status === "Printed") {
            notifs.push({
              id: reg._id,
              type: "report_printed",
              title: "Report Printed",
              message: `Your report (${reg.labCode}) is ready for pickup`,
              color: "green",
              read: isRead,
            });
          }
        });
      } else {
        // For admin/staff - show recent registrations
        allRegistrations.slice(0, 10).forEach((reg) => {
          const patientName = reg.patient?.name || "Unknown";
          const isRead = readNotifications.includes(reg._id);

          if (reg.status === "Registration") {
            notifs.push({
              id: reg._id,
              type: "registration",
              title: "New Registration",
              message: `${patientName} - ${reg.labCode}`,
              color: "blue",
              read: isRead,
            });
          } else if (reg.paidAmount > 0) {
            notifs.push({
              id: reg._id,
              type: "payment",
              title: "Payment Received",
              message: `${patientName} - ₹${reg.paidAmount} (${reg.paymentMethod})`,
              color: "green",
              read: isRead,
            });
          }
        });
      }

      setNotifications(notifs);
      const unreadCount = notifs.filter((n) => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (error) {}
  };

  const handleNotificationClick = (notifId) => {
    // Mark notification as read
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notifId ? { ...notif, read: true } : notif,
      ),
    );

    // Save to localStorage
    const readNotifications = JSON.parse(
      localStorage.getItem("readNotifications") || "[]",
    );
    if (!readNotifications.includes(notifId)) {
      readNotifications.push(notifId);
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(readNotifications),
      );
    }

    // Update count - decrease by 1
    setNotificationCount((prev) => Math.max(0, prev - 1));

    // Navigate based on user role
    if (user?.role === "patient") {
      navigate(`/patient-dashboard`);
    } else {
      navigate(`/search?registrationId=${notifId}`);
    }
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (selectedSearchIndex >= 0 && searchSuggestions[selectedSearchIndex]) {
        handlePatientSelect(searchSuggestions[selectedSearchIndex]);
      } else {
        navigate(`/search?patientName=${encodeURIComponent(searchQuery)}`);
        setSearchQuery("");
        setShowSearchSuggestions(false);
      }
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedSearchIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSearchSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSearchIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSearchIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSearchIndex >= 0) {
          handlePatientSelect(searchSuggestions[selectedSearchIndex]);
        }
        break;
      case "Escape":
        setShowSearchSuggestions(false);
        setSearchSuggestions([]);
        setSelectedSearchIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handlePatientSelect = (patient) => {
    // Navigate to test registration with patient data
    navigate("/test-registration", {
      state: {
        selectedPatient: patient,
        autoFill: true,
      },
    });
    setSearchQuery("");
    setShowSearchSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleSearchFocus = () => {
    if (searchSuggestions.length > 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
    setShowWallet(false);
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    setShowWallet(false);
  };

  const handleWalletClick = () => {
    setShowWallet(!showWallet);
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between gap-6">
        {/* Left: Lab Name */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {labSettings?.labName?.charAt(0) || "R"}
            </span>
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {labSettings?.labName || "Radiance Lab"}
            </p>
            <p className="text-slate-400 text-xs">Diagnostic Centre</p>
          </div>
        </div>

        {/* Center: Search Bar */}
        {!hideSearch && (
          <div className="relative flex-1 max-w-2xl">
            <div className="flex items-center bg-slate-700 rounded-lg px-4 py-2.5 border border-slate-600 hover:border-slate-500 transition">
              <Search size={18} className="text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search patient, lab code, mobile..."
                className="flex-1 bg-transparent ml-3 outline-none text-sm text-white placeholder-slate-400"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(e);
                  handleSearchKeyDown(e);
                }}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                autoComplete="off"
              />
              {searchLoading && (
                <div className="ml-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                </div>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div
                ref={searchSuggestionsRef}
                className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-80 overflow-y-auto"
              >
                {searchSuggestions.map((patient, index) => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-4 cursor-pointer border-b border-slate-700 hover:bg-slate-700 transition-colors ${
                      index === selectedSearchIndex ? "bg-slate-700" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <User size={14} className="text-white" />
                          </div>
                          <span className="font-medium text-white">
                            {patient.name}
                          </span>
                          {patient.isRegistered && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full border border-green-500/30">
                              Registered
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-300">
                          <div className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{patient.mobile}</span>
                          </div>
                          {patient.age && (
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>
                                {patient.age}Y, {patient.gender}
                              </span>
                            </div>
                          )}
                        </div>
                        {patient.address && (
                          <div className="text-xs text-slate-400 mt-2">
                            {patient.address}, {patient.city}
                          </div>
                        )}
                        <div className="text-xs text-blue-400 mt-2 font-medium flex items-center gap-1">
                          Click to create registration
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right: Icons and User Menu */}
        <div className="flex items-center gap-2 relative">
          {/* Wallet Icon */}
          {!hideWallet && (
            <div className="relative">
              <button
                onClick={handleWalletClick}
                className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-blue-400"
                title="Payment Summary"
              >
                <Wallet size={20} />
              </button>
              {showWallet && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Payment Summary</h3>
                    <button
                      onClick={() => setShowWallet(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <p className="text-slate-400 text-xs">
                        Total Registrations
                      </p>
                      <p className="text-white font-bold text-lg">
                        {paymentSummary.totalRegistrations}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                        <p className="text-green-300 text-xs">Cash</p>
                        <p className="text-green-400 font-bold text-sm">
                          ₹{paymentSummary.cashCollected}
                        </p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                        <p className="text-blue-300 text-xs">UPI</p>
                        <p className="text-blue-400 font-bold text-sm">
                          ₹{paymentSummary.upiReceived}
                        </p>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
                        <p className="text-orange-300 text-xs">Pending</p>
                        <p className="text-orange-400 font-bold text-sm">
                          ₹{paymentSummary.pending}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={loadPaymentSummary}
                      className="w-full mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-yellow-400 relative"
              title="Notifications"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">
                    Notifications ({notificationCount})
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-slate-700 transition border-l-4 ${
                          notif.color === "blue"
                            ? "bg-blue-500/10 border-blue-500"
                            : notif.color === "green"
                              ? "bg-green-500/10 border-green-500"
                              : "bg-orange-500/10 border-orange-500"
                        } ${notif.read ? "opacity-50" : ""}`}
                      >
                        <p className="font-semibold text-white text-xs">
                          {notif.title}
                        </p>
                        <p className="text-slate-300 text-xs mt-1">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No notifications</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={loadNotifications}
                  className="w-full mt-3 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={handleUserClick}
              className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.name}
              </span>
              <ChevronDown size={16} />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 border-b border-slate-700">
                  <p className="font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400 capitalize mt-1">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/change-password");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 border-b border-slate-700"
                >
                  <Lock size={16} />
                  Change Password
                </button>
                <button
                  onClick={() => {
                    navigate("/administration");
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center gap-2 border-b border-slate-700"
                >
                  <Settings size={16} />
                  Administration
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
