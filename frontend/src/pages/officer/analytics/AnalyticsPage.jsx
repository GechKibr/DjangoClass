import React, { useState, useEffect } from "react";
import api from "../../../api/api";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar,
  RefreshCw,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({
    totalCases: 0,
    resolvedCases: 0,
    pendingCases: 0,
    averageResolutionDays: 0,
  });
  const [casesByMonth, setCasesByMonth] = useState([]);
  const [casesByStatus, setCasesByStatus] = useState([]);
  const [casesByCategory, setCasesByCategory] = useState([]);
  const [casesBySeverity, setCasesBySeverity] = useState([]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const STATUS_COLORS = {
    new: "#3B82F6",
    under_review: "#F59E0B",
    investigation: "#8B5CF6",
    resolved: "#10B981",
    dismissed: "#6B7280",
    closed: "#374151",
  };
  const SEVERITY_COLORS = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#F97316",
    critical: "#EF4444",
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, startDate, endDate]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [casesRes, statsRes] = await Promise.all([
        api.get("cases/"),
        api.get("cases/stats/"),
      ]);

      const cases = casesRes.data.results || casesRes.data || [];
      const statsData = statsRes.data;

      // Filter by date range
      let filteredCases = cases;
      if (dateRange === "custom" && startDate && endDate) {
        filteredCases = cases.filter((c) => {
          const caseDate = new Date(c.created_at);
          return caseDate >= new Date(startDate) && caseDate <= new Date(endDate);
        });
      } else if (dateRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredCases = cases.filter((c) => new Date(c.created_at) >= monthAgo);
      } else if (dateRange === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        filteredCases = cases.filter((c) => new Date(c.created_at) >= quarterAgo);
      } else if (dateRange === "year") {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredCases = cases.filter((c) => new Date(c.created_at) >= yearAgo);
      }

      // Calculate stats
      const resolved = filteredCases.filter(
        (c) => c.status === "resolved" || c.status === "closed"
      ).length;
      const pending = filteredCases.filter(
        (c) => !["resolved", "closed", "dismissed"].includes(c.status)
      ).length;

      setStats({
        totalCases: filteredCases.length,
        resolvedCases: resolved,
        pendingCases: pending,
        averageResolutionDays: 45, // Mock value
      });

      // Cases by month
      const monthlyData = {};
      filteredCases.forEach((c) => {
        const month = new Date(c.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      setCasesByMonth(
        Object.entries(monthlyData).map(([month, count]) => ({
          month,
          cases: count,
        }))
      );

      // Cases by status
      const statusData = {};
      filteredCases.forEach((c) => {
        const status = c.status || "unknown";
        statusData[status] = (statusData[status] || 0) + 1;
      });
      setCasesByStatus(
        Object.entries(statusData).map(([name, value]) => ({ name, value }))
      );

      // Cases by category
      const categoryData = {};
      filteredCases.forEach((c) => {
        const category = c.category?.name || "Uncategorized";
        categoryData[category] = (categoryData[category] || 0) + 1;
      });
      setCasesByCategory(
        Object.entries(categoryData).map(([name, cases]) => ({ name, cases }))
      );

      // Cases by severity
      const severityData = {};
      filteredCases.forEach((c) => {
        const severity = c.severity || "unspecified";
        severityData[severity] = (severityData[severity] || 0) + 1;
      });
      setCasesBySeverity(
        Object.entries(severityData).map(([name, value]) => ({ name, value }))
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Set mock data
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    setStats({
      totalCases: 1247,
      resolvedCases: 892,
      pendingCases: 355,
      averageResolutionDays: 45,
    });

    setCasesByMonth([
      { month: "Jan 2024", cases: 45 },
      { month: "Feb 2024", cases: 52 },
      { month: "Mar 2024", cases: 48 },
      { month: "Apr 2024", cases: 60 },
      { month: "May 2024", cases: 55 },
      { month: "Jun 2024", cases: 68 },
      { month: "Jul 2024", cases: 72 },
      { month: "Aug 2024", cases: 65 },
      { month: "Sep 2024", cases: 80 },
      { month: "Oct 2024", cases: 78 },
      { month: "Nov 2024", cases: 85 },
      { month: "Dec 2024", cases: 90 },
    ]);

    setCasesByStatus([
      { name: "new", value: 150 },
      { name: "under_review", value: 200 },
      { name: "investigation", value: 250 },
      { name: "resolved", value: 500 },
      { name: "closed", value: 147 },
    ]);

    setCasesByCategory([
      { name: "Bribery", cases: 320 },
      { name: "Embezzlement", cases: 280 },
      { name: "Fraud", cases: 250 },
      { name: "Nepotism", cases: 180 },
      { name: "Extortion", cases: 120 },
      { name: "Other", cases: 97 },
    ]);

    setCasesBySeverity([
      { name: "low", value: 300 },
      { name: "medium", value: 450 },
      { name: "high", value: 350 },
      { name: "critical", value: 147 },
    ]);
  };

  const exportToCSV = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Cases", stats.totalCases],
      ["Resolved Cases", stats.resolvedCases],
      ["Pending Cases", stats.pendingCases],
      ["Average Resolution Days", stats.averageResolutionDays],
    ];

    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // In a real implementation, you would use a library like jsPDF
    alert(
      "PDF export functionality would be implemented with a library like jsPDF"
    );
  };

  const StatCard = ({ icon: Icon, title, value, color, subtext }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>
            {loading ? "..." : value.toLocaleString()}
          </p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics & Reporting
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into case management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Time" },
              { value: "month", label: "Last Month" },
              { value: "quarter", label: "Last Quarter" },
              { value: "year", label: "Last Year" },
              { value: "custom", label: "Custom" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDateRange(option.value)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  dateRange === option.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {dateRange === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          title="Total Cases"
          value={stats.totalCases}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          title="Resolved Cases"
          value={stats.resolvedCases}
          color="green"
          subtext={`${((stats.resolvedCases / stats.totalCases) * 100 || 0).toFixed(
            1
          )}% resolution rate`}
        />
        <StatCard
          icon={Clock}
          title="Pending Cases"
          value={stats.pendingCases}
          color="yellow"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg. Resolution Time"
          value={stats.averageResolutionDays}
          color="purple"
          subtext="days"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Over Time */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cases Over Time
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={casesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="cases"
                    stroke="#6366F1"
                    fill="#EEF2FF"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Cases by Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cases by Status
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={casesByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name.replace("_", " ")} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {casesByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Category */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cases by Category
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#6366F1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Cases by Severity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cases by Severity
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesBySeverity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {casesBySeverity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          SEVERITY_COLORS[entry.name] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Status Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {casesByStatus.map((status, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize`}
                      style={{
                        backgroundColor: `${
                          STATUS_COLORS[status.name] || "#6B7280"
                        }20`,
                        color: STATUS_COLORS[status.name] || "#6B7280",
                      }}
                    >
                      {status.name.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {status.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {((status.value / stats.totalCases) * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(status.value / stats.totalCases) * 100}%`,
                          backgroundColor:
                            STATUS_COLORS[status.name] || "#6B7280",
                        }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
