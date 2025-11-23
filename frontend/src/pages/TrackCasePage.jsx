import { useState } from 'react';

// Mock data - replace this with actual API call
const mockCaseData = {
  id: 1,
  title: "Bribery at checkpoint",
  description: "Officer asked for payment to allow goods to pass through checkpoint without proper documentation",
  category: "Bribery",
  location: "Addis Ababa",
  status: "Under Review",
  created_at: "2025-11-22T14:20:10Z",
  updated_at: "2025-11-22T14:20:20Z",
  is_public: true,
  status_history: [
    { status: "Received", timestamp: "2025-11-22T14:20:10Z", note: "Case submitted successfully" },
    { status: "Under Review", timestamp: "2025-11-22T15:30:00Z", note: "Case assigned for initial review" },
    { status: "Investigation In Progress", timestamp: "2025-11-23T09:15:00Z", note: "Evidence collection started" }
  ],
  public_messages: [
    { id: 1, message: "Thank you for your report. We have received your case and it's under review.", timestamp: "2025-11-22T14:25:00Z", from: "Investigation Team" },
    { id: 2, message: "We are currently gathering additional information. We will update you within 3 business days.", timestamp: "2025-11-23T09:20:00Z", from: "Case Officer" }
  ]
};

// Status configuration for badges and timeline
const statusConfig = {
  "Received": { color: "bg-gray-500", textColor: "text-gray-800", order: 1 },
  "Under Review": { color: "bg-yellow-500", textColor: "text-yellow-800", order: 2 },
  "Investigation In Progress": { color: "bg-blue-500", textColor: "text-blue-800", order: 3 },
  "Awaiting Information": { color: "bg-orange-500", textColor: "text-orange-800", order: 4 },
  "Resolved": { color: "bg-green-500", textColor: "text-green-800", order: 5 },
  "Closed": { color: "bg-purple-500", textColor: "text-purple-800", order: 6 },
  "Rejected": { color: "bg-red-500", textColor: "text-red-800", order: 7 }
};

export default function TrackCasePage() {
  const [caseId, setCaseId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackCase = async (e) => {
    e.preventDefault();
    
    if (!caseId.trim()) {
      setError('Please enter a Case ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`http://127.0.0.1:8000/api/v1/public/cases/${caseId}`);
      const data = await response.json();
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, using mock data
      if (caseId === '1' || caseId === '123') {
        setCaseData(mockCaseData);
      } else {
        setError('Case not found. Please check your Case ID and try again.');
        setCaseData(null);
      }
    } catch (err) {
      setError('Failed to fetch case details. Please try again.');
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || { color: "bg-gray-500", textColor: "text-gray-800" };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Case</h1>
          <p className="text-lg text-gray-600">
            Enter your Case ID to check the current status and updates
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrackCase} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="caseId" className="block text-sm font-medium text-gray-700 mb-2">
                Case ID / Tracking Number
              </label>
              <input
                type="text"
                id="caseId"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="Enter your case tracking number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tracking...
                  </div>
                ) : (
                  'Track Case'
                )}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Case Details */}
        {caseData && (
          <div className="space-y-8">
            {/* Case Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{caseData.title}</h2>
                  <p className="text-gray-600">Case ID: {caseData.id}</p>
                </div>
                <div className="mt-4 lg:mt-0">
                  {getStatusBadge(caseData.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
                  <p className="text-gray-900">{caseData.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <p className="text-gray-900">{caseData.location}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Date Submitted</h3>
                  <p className="text-gray-900">{formatDate(caseData.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                  <p className="text-gray-900">{formatDate(caseData.updated_at)}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-900 leading-relaxed">{caseData.description}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Case Status Timeline</h3>
              <div className="space-y-4">
                {caseData.status_history
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((history, index) => (
                    <div key={index} className="flex">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-3 h-3 rounded-full ${
                          statusConfig[history.status]?.color || 'bg-gray-500'
                        }`} />
                        {index < caseData.status_history.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                          <span className="font-medium text-gray-900">{history.status}</span>
                          <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                            {formatDate(history.timestamp)}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-gray-600 text-sm mt-1">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Public Messages */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Messages from Investigation Team</h3>
              <div className="space-y-4">
                {caseData.public_messages.map((message) => (
                  <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <span className="font-medium text-gray-900">{message.from}</span>
                      <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}