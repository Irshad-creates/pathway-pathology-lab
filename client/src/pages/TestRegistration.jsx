import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import Navbar from "../components/Navbar";
import TestDualList from "../components/TestDualList";
import BillingPanel from "../components/BillingPanel";
import QRPayment from "../components/QRPayment";
import PatientAutocomplete from "../components/PatientAutocomplete";
import UnsavedChangesModal from "../components/UnsavedChangesModal";
import { useToast } from "../hooks/useToast";
import { AuthContext } from "../context/AuthContext";
import { registrationAPI, patientAPI, settingsAPI } from "../services/api";
import { User, Phone, MapPin, FileText, CheckCircle } from "lucide-react";

export default function TestRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useContext(AuthContext);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [patient, setPatient] = useState({
    patientType: "OPD",
    title: "Mr.",
    name: "",
    gender: "Male",
    age: "",
    ageUnit: "Yr",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    doctorName: "",
    collectionCenter: "Pathway Pathology Lab",
    affiliation: "",
    isRegistered: false,
    homeCollection: false,
    sampleCollectedAt: "",
    collectionRoundBoy: "",
    isUrgent: false,
  });

  const [tests, setTests] = useState([]);
  const [billing, setBilling] = useState({});
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingPatient, setExistingPatient] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [createdRegistration, setCreatedRegistration] = useState(null);
  const [labSettings, setLabSettings] = useState(() => {
    // Initialize from localStorage to avoid flash
    try {
      const cached = localStorage.getItem("labSettings");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [patientExternallySelected, setPatientExternallySelected] =
    useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      patient,
      tests,
      billing,
      comment,
      activeStep,
    };
    localStorage.setItem("testRegistrationFormData", JSON.stringify(formData));
  }, [patient, tests, billing, comment, activeStep]);

  // Load form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("testRegistrationFormData");
    if (savedFormData) {
      try {
        const {
          patient: savedPatient,
          tests: savedTests,
          billing: savedBilling,
          comment: savedComment,
          activeStep: savedActiveStep,
        } = JSON.parse(savedFormData);
        setPatient(savedPatient);
        setTests(savedTests);
        setBilling(savedBilling);
        setComment(savedComment);
        setActiveStep(savedActiveStep);
      } catch (error) {
        // Error parsing saved data, continue with defaults
      }
    }
  }, []);

  const handlePaymentComplete = async (paymentData) => {
    setBilling((prev) => ({
      ...prev,
      paymentMethod: paymentData.method,
      paidAmount: paymentData.amount,
      transactionId: paymentData.transactionId,
      paymentVerified: paymentData.verified,
    }));

    toast.success(`Payment of ₹${paymentData.amount} completed successfully!`);
  };

  const openRazorpayPayment = () => {
    const amountToPay = Math.max(0, billing.balanceAmount);

    if (amountToPay <= 0) {
      createRegistration();
      return;
    }

    const options = {
      key: "rzp_test_SVnfr7CXPRGk7Y",
      amount: amountToPay * 100,
      currency: "INR",
      name: labSettings?.labName || "Pathway Pathology Lab",
      description: `Payment for ${tests.map((t) => t.name).join(", ")}`,
      handler: async function (response) {
        const paymentData = {
          method: "UPI",
          amount: amountToPay,
          transactionId: response.razorpay_payment_id,
          verified: true,
          paidAmount: amountToPay,
        };
        await createRegistration(paymentData);
      },
      prefill: {
        name: patient.name,
        email: patient.email,
        contact: patient.mobile,
      },
      theme: {
        color: "#3399cc",
      },
    };

    if (!window.Razorpay) {
      toast.error(
        "Razorpay library not loaded. Please refresh the page and try again.",
      );
      return;
    }

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Failed to open payment gateway: " + error.message);
    }
  };

  useEffect(() => {
    loadLabSettings();
  }, []);

  useEffect(() => {
    if (location.state?.selectedPatient && location.state?.autoFill) {
      const selectedPatient = location.state.selectedPatient;
      setExistingPatient(selectedPatient);
      setIsNewPatient(false);
      setPatientExternallySelected(true);
      handlePatientSelect(selectedPatient);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  const loadLabSettings = async () => {
    try {
      const res = await settingsAPI.get();
      const settings = res.data;
      setLabSettings(settings);
      // Cache in localStorage for persistence across navigation
      localStorage.setItem("labSettings", JSON.stringify(settings));
      setPatient((prev) => ({
        ...prev,
        collectionCenter: settings.labName || "Pathway Pathology Lab",
      }));
    } catch (error) {
      // Use cached settings if API fails
    }
  };

  useEffect(() => {
    const hasChanges =
      patient.name ||
      patient.mobile ||
      patient.email ||
      tests.length > 0 ||
      comment;
    setHasUnsavedChanges(hasChanges);
  }, [patient, tests, comment]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowUnsavedModal(true);
    } else {
      navigate(path);
    }
  };

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false);
    setHasUnsavedChanges(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedModal(false);
    setPendingNavigation(null);
  };

  const handlePatientChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatient((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (activeStep === 1 && (patient.name || patient.mobile || patient.email)) {
      setActiveStep(1);
    }
  };

  const handlePatientSelect = (selectedPatient) => {
    setExistingPatient(selectedPatient);
    setIsNewPatient(false);

    setPatient({
      patientType: selectedPatient.patientType || "OPD",
      title: selectedPatient.name?.startsWith("Mrs.")
        ? "Mrs."
        : selectedPatient.name?.startsWith("Ms.")
          ? "Ms."
          : "Mr.",
      name: selectedPatient.name || "",
      gender: selectedPatient.gender || "Male",
      age: selectedPatient.age || "",
      ageUnit: "Yr",
      dob: selectedPatient.dob
        ? new Date(selectedPatient.dob).toISOString().split("T")[0]
        : "",
      mobile: selectedPatient.mobile || "",
      email: selectedPatient.email || "",
      address: selectedPatient.address || "",
      city: selectedPatient.city || "",
      doctorName: selectedPatient.doctorName || "",
      collectionCenter:
        selectedPatient.collectionCenter ||
        labSettings?.labName ||
        "Pathway Pathology Lab",
      affiliation: selectedPatient.affiliation || "",
      isRegistered: selectedPatient.isRegistered || false,
      homeCollection: false,
      sampleCollectedAt: "",
      collectionRoundBoy: "",
    });
  };

  const handleNewPatientInput = () => {
    setExistingPatient(null);
    setIsNewPatient(true);
    setPatientExternallySelected(false);
  };

  const validateRequiredFields = () => {
    const requiredFields = [
      { field: "name", label: "Patient Name" },
      { field: "age", label: "Age" },
      { field: "gender", label: "Gender" },
      { field: "dob", label: "Date of Birth" },
      { field: "mobile", label: "Mobile Number" },
      { field: "email", label: "Email" },
      { field: "address", label: "Address" },
      { field: "city", label: "City" },
      { field: "doctorName", label: "Doctor Name" },
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = patient[field];
      return !value || value.toString().trim() === "";
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(({ label }) => label).join(", ");
      toast.error(`Please fill in all required fields: ${fieldNames}`);
      return false;
    }

    if (tests.length === 0) {
      toast.error("Please select at least one test before submitting.");
      return false;
    }

    if (billing.paymentMethod === "Cash") {
      const paidAmount = parseFloat(billing.paidAmount) || 0;
      if (paidAmount <= 0) {
        toast.error("Please enter the paid amount for Cash payment.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRequiredFields()) {
      return;
    }

    if (billing.paymentMethod === "UPI") {
      openRazorpayPayment();
      return;
    }

    await createRegistration();
  };

  const createRegistration = async (paymentData = null) => {
    setLoading(true);

    try {
      // Check if user has permission to create registration
      if (!user || (user.role !== "staff" && user.role !== "admin")) {
        toast.error(
          "You don't have permission to create registrations. Please contact your administrator.",
        );
        setLoading(false);
        return;
      }

      let patientId;

      if (existingPatient && !isNewPatient) {
        patientId = existingPatient._id;
        await patientAPI.update(existingPatient._id, {
          email: patient.email,
          address: patient.address,
          city: patient.city,
          doctorName: patient.doctorName,
          collectionCenter: patient.collectionCenter,
          affiliation: patient.affiliation,
        });
      } else {
        const patientRes = await patientAPI.create(patient);
        patientId = patientRes.data._id;
      }

      const billingData = { ...billing };
      if (paymentData) {
        billingData.paidAmount = paymentData.amount;
        billingData.transactionId = paymentData.transactionId;
        billingData.paymentVerified = paymentData.verified;
      }

      let status = "Registration";
      const totalPaid = parseFloat(billingData.paidAmount) || 0;
      const netAmount = parseFloat(billingData.netAmount) || 0;

      if (totalPaid >= netAmount) {
        status = "Sample Pending";
      }

      if (billingData.paymentMethod === "Send to WhatsApp (Pending)") {
        status = "Registration";
      }

      const registrationData = {
        patient: patientId,
        tests: tests.map((t) => ({
          test: t._id,
          testName: t.name,
          price: t.price,
          referenceRange: t.referenceRange || "N/A",
          unit: t.unit || "",
          discountAmt: t.discountAmt || 0,
          discountPct: t.discountPct || 0,
          refund: t.refund || 0,
        })),
        ...billingData,
        comment,
        status,
      };

      const response = await registrationAPI.create(registrationData);
      const newRegistration = response.data;
      setCreatedRegistration(newRegistration);

      if (billing.paymentMethod === "Send to WhatsApp (Pending)") {
        const testNames = tests.map((t) => t.shortName || t.name).join(", ");
        const labName = labSettings?.labName || "Pathway Pathology Lab";
        const reportTime = labSettings?.reportGenerationTime || "tomorrow";
        const whatsappMessage = `${labName}\nHey ${patient.name},\nYour tests is being registered,\nTests are: ${testNames}\nYour bill is ₹${billing.netAmount}\nTest results will be generated ${reportTime}.\nThank you.`;
        const whatsappLink = `https://wa.me/91${patient.mobile?.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappLink, "_blank");
      }

      if (billing.paymentMethod === "Cash") {
        const testNames = tests.map((t) => t.shortName || t.name).join(", ");
        const labName = labSettings?.labName || "Pathway Pathology Lab";
        const reportTime = labSettings?.reportGenerationTime || "tomorrow";
        const whatsappMessage = `${labName}\nHey ${patient.name},\nYour tests is being registered,\nTests are: ${testNames}\nYour bill is ₹${billing.netAmount}\nTest results will be generated ${reportTime}.\nThank you.`;
        const whatsappLink = `https://wa.me/91${patient.mobile?.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappLink, "_blank");
      }

      const successMessage =
        existingPatient && !isNewPatient
          ? `Registration created successfully for existing patient: ${patient.name}!`
          : `Registration created successfully for new patient: ${patient.name}!`;

      toast.success(successMessage);
      setHasUnsavedChanges(false);
      navigate("/search");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      toast.error("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopHeader />
      <Navbar onNavigate={handleNavigate} />

      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Test Registration
          </h1>
          <p className="text-slate-600 mt-2">
            Register a new patient and select tests
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: "Patient Info", icon: User },
              { step: 2, label: "Select Tests", icon: FileText },
              { step: 3, label: "Billing", icon: null, rupee: true },
              { step: 4, label: "Confirm", icon: CheckCircle },
            ].map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeStep === item.step;
              const isCompleted = activeStep > item.step;

              return (
                <div key={item.step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition ${isActive ? "bg-blue-600 border-blue-600 text-white" : isCompleted ? "bg-green-100 border-green-600 text-green-600" : "bg-slate-100 border-slate-300 text-slate-600"}`}
                  >
                    {item.rupee ? (
                      <span className="text-xl font-bold">₹</span>
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </p>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded ${isCompleted ? "bg-green-600" : "bg-slate-200"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Details Section - Modern Layout */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full opacity-10 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full opacity-10 -ml-16 -mb-16"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <User size={24} />
                    </div>
                    Patient Information
                  </h2>
                  <p className="text-slate-600 text-sm mt-1">
                    Enter patient details and medical information
                  </p>
                </div>
                {existingPatient && !isNewPatient && (
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-300 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Existing Patient
                    </span>
                    <button
                      type="button"
                      onClick={handleNewPatientInput}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      Add as New
                    </button>
                  </div>
                )}
              </div>

              {/* Patient Type & IDs - Compact Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-blue-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Patient Type
                  </label>
                  <select
                    name="patientType"
                    value={patient.patientType}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
                  >
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                    <option value="CASHLESS">CASHLESS</option>
                    <option value="WALKIN">WALKIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium"
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Lab Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 font-medium"
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>
              </div>

              {/* Main Patient Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                {/* Patient Name */}
                <div className="lg:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Patient Name *
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="title"
                      value={patient.title}
                      onChange={handlePatientChange}
                      className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      disabled={existingPatient && !isNewPatient}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                    <PatientAutocomplete
                      value={patient.name}
                      onChange={(e) => {
                        handlePatientChange(e);
                        if (existingPatient) {
                          handleNewPatientInput();
                        }
                      }}
                      onPatientSelect={handlePatientSelect}
                      className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium ${existingPatient && !isNewPatient ? "bg-green-50 border-green-300" : "border-slate-300"}`}
                      placeholder="Full Name"
                      required
                      externallySelected={patientExternallySelected}
                    />
                  </div>
                </div>

                {/* Age & Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Age *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="age"
                      value={patient.age}
                      onChange={handlePatientChange}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      placeholder="Age"
                      required
                    />
                    <select
                      name="ageUnit"
                      value={patient.ageUnit}
                      onChange={handlePatientChange}
                      className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    >
                      <option value="Yr">Yr</option>
                      <option value="Mo">Mo</option>
                      <option value="Day">Day</option>
                    </select>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Gender *
                  </label>
                  <div className="flex gap-3 mt-2.5">
                    {["Male", "Female", "None"].map((g) => (
                      <label
                        key={g}
                        className="flex items-center text-sm font-medium cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={patient.gender === g}
                          onChange={handlePatientChange}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="ml-2">{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={patient.dob}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <Phone size={14} />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={patient.mobile}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={patient.email}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
              </div>

              {/* Address, City, Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2 flex items-center gap-1">
                    <MapPin size={14} />
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={patient.address}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={patient.city}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={patient.doctorName}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
              </div>

              {/* Collection & Registration Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 pb-6 pt-6 border-b border-blue-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Collection Center
                  </label>
                  <input
                    type="text"
                    name="collectionCenter"
                    value={patient.collectionCenter}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Lab center name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Sample Collected At
                  </label>
                  <input
                    type="text"
                    name="sampleCollectedAt"
                    value={patient.sampleCollectedAt}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Collection location/time"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Collection Round Boy
                  </label>
                  <input
                    type="text"
                    name="collectionRoundBoy"
                    value={patient.collectionRoundBoy}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Person name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    Affiliation
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    value={patient.affiliation}
                    onChange={handlePatientChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    placeholder="Hospital/clinic name"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRegistered"
                    checked={patient.isRegistered}
                    onChange={handlePatientChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Is Registered
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="homeCollection"
                    checked={patient.homeCollection}
                    onChange={handlePatientChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Home Collection
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={patient.isUrgent}
                    onChange={handlePatientChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-red-700">
                    Mark as Urgent
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Test Selection */}
          <TestDualList
            onTestsChange={(selectedTests) => {
              setTests(selectedTests);
              if (selectedTests.length > 0 && activeStep < 2) {
                setActiveStep(2);
              }
            }}
            comment={comment}
            onCommentChange={setComment}
          />

          {/* Billing */}
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-200 p-8 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200 rounded-full opacity-10 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200 rounded-full opacity-10 -ml-16 -mb-16"></div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ₹
                </div>
                <span>Billing & Payment</span>
              </h2>

              <BillingPanel
                tests={tests}
                onBillingChange={(billingData) => {
                  setBilling(billingData);
                  if (tests.length > 0 && activeStep < 3) {
                    setActiveStep(3);
                  }
                }}
              />
            </div>
          </div>

          {/* QR & WhatsApp for non-UPI payments */}
          {tests.length > 0 && billing.paymentMethod !== "UPI" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <QRPayment
                netAmount={billing.netAmount || 0}
                balanceAmount={billing.balanceAmount || 0}
                patientName={patient.name}
                tests={tests}
                mobile={patient.mobile}
                paymentMethod={billing.paymentMethod}
                registrationId={createdRegistration?._id}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-center pb-8">
            <button
              type="submit"
              onClick={() => {
                if (validateRequiredFields()) {
                  setActiveStep(4);
                }
              }}
              disabled={loading || tests.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center gap-2"
            >
              <CheckCircle size={20} />
              {loading
                ? "Processing..."
                : billing.paymentMethod === "UPI"
                  ? "Proceed to Payment"
                  : "Save Registration"}
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("testRegistrationFormData");
                setPatient({
                  patientType: "OPD",
                  title: "Mr.",
                  name: "",
                  gender: "Male",
                  age: "",
                  ageUnit: "Yr",
                  dob: "",
                  mobile: "",
                  email: "",
                  address: "",
                  city: "",
                  doctorName: "",
                  collectionCenter: "Pathway Pathology Lab",
                  affiliation: "",
                  isRegistered: false,
                  homeCollection: false,
                  sampleCollectedAt: "",
                  collectionRoundBoy: "",
                });
                setTests([]);
                setBilling({});
                setComment("");
                setActiveStep(1);
                setExistingPatient(null);
                setIsNewPatient(true);
                setHasUnsavedChanges(false);
              }}
              className="px-8 py-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition font-semibold"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/search")}
              className="px-8 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </div>
  );
}
