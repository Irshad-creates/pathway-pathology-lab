import { useState, useEffect, useRef } from "react";
import { patientAPI } from "../services/api";
import { User, Phone, MapPin, Users } from "lucide-react";

export default function PatientAutocomplete({
  value,
  onChange,
  onPatientSelect,
  className = "form-input flex-1",
  placeholder = "Full Name",
  required = false,
  externallySelected = false, // New prop to indicate external selection
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [patientSelected, setPatientSelected] = useState(false);
  const [lastSelectedName, setLastSelectedName] = useState("");
  const inputRef = useRef();
  const suggestionsRef = useRef();

  useEffect(() => {
    const searchPatients = async () => {
      // Don't search if patient was selected (internally or externally) and name hasn't changed
      if (
        (patientSelected || externallySelected) &&
        value === lastSelectedName
      ) {
        return;
      }

      if (value.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const res = await patientAPI.getSuggestions(value);
        setSuggestions(res.data);
        setShowSuggestions(
          res.data.length > 0 && !patientSelected && !externallySelected,
        );
        setSelectedIndex(-1);
      } catch (error) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounceTimer);
    return () => clearTimeout(debounceTimer);
  }, [value, patientSelected, lastSelectedName, externallySelected]);

  const handleInputChange = (e) => {
    onChange(e);

    // If user is typing and it's different from the last selected name, reset patient selection
    if (e.target.value !== lastSelectedName) {
      setPatientSelected(false);
      setLastSelectedName("");
    }

    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (patient) => {
    onChange({ target: { name: "name", value: patient.name } });
    setPatientSelected(true);
    setLastSelectedName(patient.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onPatientSelect(patient);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    // Only show suggestions if no patient is currently selected (internally or externally)
    if (suggestions.length > 0 && !patientSelected && !externallySelected) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        name="name"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={className}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suggestions.map((patient, index) => (
            <div
              key={patient._id}
              onClick={() => handleSuggestionClick(patient)}
              className={`px-4 py-4 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-sm text-slate-500">{patient.mobile}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">
                    {patient.age}Y
                  </p>
                  <p className="text-xs text-slate-500">{patient.gender}</p>
                </div>
              </div>
              {patient.isRegistered && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-700 font-medium">
                    Registered
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
