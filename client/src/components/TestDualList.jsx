import { useState, useEffect } from "react";
import { testAPI } from "../services/api";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  MessageSquare,
} from "lucide-react";

export default function TestDualList({
  onTestsChange,
  comment,
  onCommentChange,
}) {
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchBy, setSearchBy] = useState("shortName");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedAvailable, setSelectedAvailable] = useState(new Set());
  const [selectedInList, setSelectedInList] = useState(new Set());

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await testAPI.getAll();
      setAvailableTests(res.data);
      const cats = [...new Set(res.data.map((t) => t.category))];
      setCategories(cats);
    } catch (error) {}
  };

  const filteredTests = availableTests.filter((test) => {
    const searchField = searchBy === "shortName" ? test.shortName : test.name;
    const matchesSearch = searchField
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = !category || test.category === category;
    return (
      matchesSearch &&
      matchesCategory &&
      !selectedTests.find((t) => t._id === test._id)
    );
  });

  const handleAddTest = () => {
    if (selectedAvailable.size === 0) {
      alert("Please select at least one test to add");
      return;
    }
    const testsToAdd = filteredTests.filter((t) =>
      selectedAvailable.has(t._id),
    );
    const newSelected = [
      ...selectedTests,
      ...testsToAdd.map((t) => ({ ...t, discount: 0, refund: 0 })),
    ];
    setSelectedTests(newSelected);
    onTestsChange(newSelected);
    setSelectedAvailable(new Set());
  };

  const handleAddAll = () => {
    const newSelected = [
      ...selectedTests,
      ...filteredTests
        .filter((t) => !selectedTests.find((s) => s._id === t._id))
        .map((t) => ({ ...t, discount: 0, refund: 0 })),
    ];
    setSelectedTests(newSelected);
    onTestsChange(newSelected);
  };

  const handleRemoveTest = () => {
    if (selectedInList.size === 0) {
      alert("Please select at least one test to remove");
      return;
    }
    const newSelected = selectedTests.filter((t) => !selectedInList.has(t._id));
    setSelectedTests(newSelected);
    onTestsChange(newSelected);
    setSelectedInList(new Set());
  };

  const handleRemoveAll = () => {
    if (selectedTests.length === 0) {
      alert("No tests to remove");
      return;
    }
    setSelectedTests([]);
    onTestsChange([]);
    setSelectedInList(new Set());
  };

  const toggleAvailableSelection = (testId) => {
    const newSelected = new Set(selectedAvailable);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedAvailable(newSelected);
  };

  const toggleListSelection = (testId) => {
    const newSelected = new Set(selectedInList);
    if (newSelected.has(testId)) {
      newSelected.delete(testId);
    } else {
      newSelected.add(testId);
    }
    setSelectedInList(newSelected);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Filter size={24} className="text-blue-600" />
        Select Tests
      </h2>

      {/* Search & Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search By
          </label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="shortName">Short Name</option>
            <option value="name">Display Name</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
            <Search size={16} />
            Search Test
          </label>
          <input
            type="text"
            placeholder="Search test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
            <MessageSquare size={16} />
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            style={{ height: "2.6rem", minHeight: "2.6rem" }}
            placeholder="Special notes..."
          />
        </div>
      </div>

      {/* Dual List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Tests */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">
              Available Tests{" "}
              <span className="text-blue-600">({filteredTests.length})</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            {filteredTests.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-sm">No tests available</p>
              </div>
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test._id}
                  onClick={() => toggleAvailableSelection(test._id)}
                  className={`p-3 border-b border-slate-200 cursor-pointer transition hover:bg-blue-50 flex items-start gap-3 ${
                    selectedAvailable.has(test._id) ? "bg-blue-100" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAvailable.has(test._id)}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">
                      {test.shortName}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {test.name}
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      ₹{test.price}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-2">
          <button
            type="button"
            onClick={handleAddTest}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-sm"
          >
            <ChevronRight size={18} /> Add
          </button>
          <button
            type="button"
            onClick={handleAddAll}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold text-sm shadow-sm"
          >
            <ChevronRight size={18} /> Add All
          </button>
          <div className="border-t border-slate-300 my-2"></div>
          <button
            type="button"
            onClick={handleRemoveTest}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm shadow-sm"
          >
            <ChevronLeft size={18} /> Remove
          </button>
          <button
            type="button"
            onClick={handleRemoveAll}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm shadow-sm"
          >
            <ChevronLeft size={18} /> Remove All
          </button>
        </div>

        {/* Selected Tests */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">
              Selected Tests{" "}
              <span className="text-green-600">({selectedTests.length})</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80">
            {selectedTests.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p className="text-sm">No tests selected</p>
              </div>
            ) : (
              selectedTests.map((test) => (
                <div
                  key={test._id}
                  onClick={() => toggleListSelection(test._id)}
                  className={`p-3 border-b border-slate-200 cursor-pointer transition hover:bg-green-50 flex items-start gap-3 ${
                    selectedInList.has(test._id) ? "bg-green-100" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedInList.has(test._id)}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900">
                      {test.shortName}
                    </div>
                    <div className="text-xs text-slate-600 truncate">
                      {test.name}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-blue-600">
                        ₹{test.price}
                      </span>
                      {test.discount > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          Disc: {test.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
