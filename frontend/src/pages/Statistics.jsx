import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Statistics = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [reporterStats, setReporterStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];
  const STATUS_COLORS = {
    Resolved: "#10B981",
    Pending: "#F59E0B",
    "Under Review": "#3B82F6",
    Rejected: "#EF4444",
    Investigation: "#8B5CF6",
  };

  const API_BASE_URL =
    "https://7b527c1e-7d5e-433a-8740-0f04ec8143d1-00-3cs6hem46d233.spock.replit.dev:8000/api/v1/dashboard";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const endpoints = [
          fetch(`${API_BASE_URL}/summary/`),
          fetch(`${API_BASE_URL}/cases-per-month/`),
          fetch(`${API_BASE_URL}/status-count/`),
          fetch(`${API_BASE_URL}/reporter-stats/`),
        ];

        const responses = await Promise.all(endpoints);

        // Check for any failed responses
        const failedResponse = responses.find((response) => !response.ok);
        if (failedResponse) {
          throw new Error(`HTTP error! status: ${failedResponse.status}`);
        }

        const data = await Promise.all(
          responses.map((response) => response.json())
        );

        setSummaryData(data[0]);
        setMonthlyData(data[1] || []);
        setStatusData(data[2] || []);
        setReporterStats(data[3] || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load statistics data. Please try again later.");

        // Set mock data for demonstration
        setMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mock data for demonstration when API is unavailable
  const setMockData = () => {
    setSummaryData({
      total_reports: 1247,
      resolved_cases: 892,
      pending_cases: 355,
      average_resolution_days: 45,
    });

    setMonthlyData([
      { month: "Jan", cases: 45 },
      { month: "Feb", cases: 52 },
      { month: "Mar", cases: 48 },
      { month: "Apr", cases: 60 },
      { month: "May", cases: 55 },
      { month: "Jun", cases: 68 },
      { month: "Jul", cases: 72 },
      { month: "Aug", cases: 65 },
      { month: "Sep", cases: 80 },
      { month: "Oct", cases: 78 },
      { month: "Nov", cases: 85 },
      { month: "Dec", cases: 90 },
    ]);

    setStatusData([
      { name: "Resolved", value: 892 },
      { name: "Pending", value: 200 },
      { name: "Under Review", value: 155 },
      { name: "Rejected", value: 100 },
    ]);

    setReporterStats([
      { region: "Addis Ababa", cases: 450 },
      { region: "Oromia", cases: 320 },
      { region: "Amhara", cases: 280 },
      { region: "SNNPR", cases: 197 },
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !summaryData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Public Transparency Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time statistics and insights into corruption reporting and case
            resolution
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              {error} Showing demonstration data.
            </p>
          </div>
        )}

        {/* Key Metrics */}
        {summaryData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {summaryData.total_reports?.toLocaleString() || "0"}
              </div>
              <div className="text-gray-600 font-medium">Total Reports</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {summaryData.resolved_cases?.toLocaleString() || "0"}
              </div>
              <div className="text-gray-600 font-medium">Resolved Cases</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {summaryData.pending_cases?.toLocaleString() || "0"}
              </div>
              <div className="text-gray-600 font-medium">Pending Cases</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {summaryData.average_resolution_days || "0"}
              </div>
              <div className="text-gray-600 font-medium">
                Avg. Resolution Days
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reports Over Time - Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Reports Submitted Over Time
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="Number of Cases"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Case Status Distribution - Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Case Status Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Cases"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Reports by Region - Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Reports by Region
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reporterStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cases"
                    name="Number of Cases"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            About This Dashboard
          </h3>
          <p className="text-blue-800">
            This transparency dashboard provides real-time insights into
            corruption reporting patterns, case resolution efficiency, and
            regional distribution of reports. All data is anonymized to protect
            whistleblower identities while maintaining accountability and
            transparency.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
