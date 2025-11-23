import { useState } from "react";

const statusConfig = {
  received: { color: "bg-gray-500", textColor: "text-gray-800" },
  "under review": { color: "bg-yellow-500", textColor: "text-yellow-800" },
  "investigation in progress": { color: "bg-blue-500", textColor: "text-blue-800" },
  resolved: { color: "bg-green-500", textColor: "text-green-800" },
  closed: { color: "bg-purple-500", textColor: "text-purple-800" },
  rejected: { color: "bg-red-500", textColor: "text-red-800" },
};

export default function TrackCasePage() {
  const [caseId, setCaseId] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrackCase = async (e) => {
    e.preventDefault();
    if (!caseId.trim()) {
      setError("Please enter a Case ID");
      return;
    }

    setLoading(true);
    setError("");
    setCaseData(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/public/cases/track/${caseId}`
      );

      if (!response.ok) {
        setError("Case not found. Please check your Case ID.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCaseData(data);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status) => {
    const key = status?.toLowerCase();
    const conf = statusConfig[key] || {
      color: "bg-gray-500",
      textColor: "text-white",
    };

    return (
      <span
        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${conf.color} ${conf.textColor}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Track Your Case</h1>
          <p className="text-gray-600 mt-2">
            Enter your tracking ID to see the current status.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 shadow rounded-lg mb-8">
          <form onSubmit={handleTrackCase} className="flex flex-col gap-4">
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="Enter tracking number"
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Tracking..." : "Track Case"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Case Data */}
        {caseData && (
          <div className="bg-white p-6 shadow rounded-lg space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{caseData.title || "No Title"}</h2>
                <p className="text-gray-600">
                  Tracking ID: {caseData.tracking_id}
                </p>
              </div>
              {getStatusBadge(caseData.status)}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Severity</p>
                <p className="font-medium">{caseData.severity || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(caseData.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Update</p>
                <p className="font-medium">{formatDate(caseData.updated_at)}</p>
              </div>
            </div>

            {/* Description (optional) */}
            {caseData.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-800">{caseData.description}</p>
              </div>
            )}

            {/* Status History (if backend returns it later) */}
            {caseData.status_history && caseData.status_history.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Status Timeline
                </h3>
                <div className="space-y-3">
                  {caseData.status_history.map((h, i) => (
                    <div key={i} className="border-l-4 border-blue-500 pl-4">
                      <p className="font-semibold">{h.status}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(h.timestamp)}
                      </p>
                      {h.note && (
                        <p className="text-gray-700 mt-1">{h.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public Messages */}
            {caseData.public_messages && caseData.public_messages.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Messages From Investigation Team
                </h3>
                <div className="space-y-4">
                  {caseData.public_messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="border-l-4 border-blue-600 pl-4 py-2"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{msg.from}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
