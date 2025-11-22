import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";
import CaseDetailModal from "./CaseDetailModal";


function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const fetchCases = () => {
    setLoading(true);
    fetch(`${API_BASE}/cases/`)
      .then((res) => res.json())
      .then((data) => {
        setCases(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Cases</h2>
      {loading ? (
        <p className="text-gray-500">Loading cases...</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <li
              key={c.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl cursor-pointer transition transform hover:-translate-y-1"
              onClick={() => setSelectedCase(c)}
            >
              <h3 className="text-xl font-semibold mb-1">{c.title}</h3>
              <p className="text-gray-600 mb-2">
                Reporter: {c.is_anonymous ? "Anonymous" : c.reporter?.username || "N/A"}
              </p>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  c.status === "new"
                    ? "bg-gray-100 text-gray-800"
                    : c.status === "under_review"
                    ? "bg-yellow-100 text-yellow-800"
                    : c.status === "investigation"
                    ? "bg-blue-100 text-blue-800"
                    : c.status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : c.status === "dismissed"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {c.status.replace("_", " ").toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}

export default CaseList;
