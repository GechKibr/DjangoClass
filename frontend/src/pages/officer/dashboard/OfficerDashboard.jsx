import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myAssignedCases: 0,
    newUnassignedCases: 0,
    urgentCases: 0,
    resolvedThisMonth: 0,
    totalCases: 0,
  });
  const [recentCases, setRecentCases] = useState([]);
  const [casesByStatus, setCasesByStatus] = useState([]);
  const [casesByCategory, setCasesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch officer-specific stats
        const [casesRes, statsRes] = await Promise.all([
          api.get("cases/", { params: { perPage: 5 } }),
          api.get("cases/stats/"),
        ]);

        // Calculate stats
        const cases = casesRes.data.results || casesRes.data || [];
        const statsData = statsRes.data;

        // Count cases assigned to me
        const myAssigned = cases.filter(
          (c) => c.assigned_to === user?.id
        ).length;

        // Count unassigned new cases
        const unassigned = cases.filter(
          (c) => !c.assigned_to && c.status === "new"
        ).length;

        // Count urgent cases (high/critical severity)
        const urgent = cases.filter(
          (c) =>
            (c.severity === "high" || c.severity === "critical") &&
            c.status !== "resolved" &&
            c.status !== "closed"
        ).length;

        // Get current month resolved cases
        const currentMonth = new Date().getMonth();
        const resolvedThisMonth = cases.filter((c) => {
          const caseMonth = new Date(c.updated_at).getMonth();
          return (
            (c.status === "resolved" || c.status === "closed") &&
            caseMonth === currentMonth
          );
        }).length;

        setStats({
          myAssignedCases: statsData.my_assigned_cases || myAssigned,
          newUnassignedCases: unassigned,
          urgentCases: urgent,
          resolvedThisMonth: resolvedThisMonth,
          totalCases: statsData.total_cases || cases.length,
        });

        setRecentCases(cases.slice(0, 5));

        // Process status data for chart
        const statusData = statsData.cases_by_status || [];
        setCasesByStatus(
          statusData.map((item) => ({
            name: item.status?.replace("_", " ") || "Unknown",
            value: item.count,
          }))
        );

        // Process category data for chart
        const categoryData = statsData.cases_by_category || [];
        setCasesByCategory(
          categoryData.map((item) => ({
            name: item.category__name || "Uncategorized",
            cases: item.count,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set mock data if API fails
        setStats({
          myAssignedCases: 12,
          newUnassignedCases: 8,
          urgentCases: 3,
          resolvedThisMonth: 15,
          totalCases: 156,
        });
        setCasesByStatus([
          { name: "New", value: 25 },
          { name: "Under Review", value: 18 },
          { name: "Investigation", value: 32 },
          { name: "Resolved", value: 45 },
          { name: "Closed", value: 36 },
        ]);
        setCasesByCategory([
          { name: "Bribery", cases: 45 },
          { name: "Embezzlement", cases: 32 },
          { name: "Fraud", cases: 28 },
          { name: "Nepotism", cases: 22 },
          { name: "Other", cases: 29 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <Link
      to={link}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>
            {loading ? "..." : value}
          </p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Link>
  );

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      under_review: "bg-yellow-100 text-yellow-800",
      investigation: "bg-purple-100 text-purple-800",
      resolved: "bg-green-100 text-green-800",
      dismissed: "bg-gray-100 text-gray-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.first_name || user?.username}!
            </h1>
            <p className="text-indigo-100">
              Here's an overview of your case management activities today.
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-indigo-200" />
            <span className="text-indigo-100">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          title="Cases Assigned to Me"
          value={stats.myAssignedCases}
          color="blue"
          link="/officer/cases?assigned_to=me"
        />
        <StatCard
          icon={Clock}
          title="New Unassigned Cases"
          value={stats.newUnassignedCases}
          color="yellow"
          link="/officer/cases?status=new"
        />
        <StatCard
          icon={AlertTriangle}
          title="Urgent Priority Cases"
          value={stats.urgentCases}
          color="red"
          link="/officer/cases?severity=high"
        />
        <StatCard
          icon={CheckCircle}
          title="Cases Resolved This Month"
          value={stats.resolvedThisMonth}
          color="green"
          link="/officer/cases?status=resolved"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/officer/cases?status=new"
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Review New Cases
          </Link>
          <Link
            to="/officer/cases/new"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Case
          </Link>
          <Link
            to="/officer/analytics"
            className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {casesByStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

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
                <BarChart data={casesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
          <Link
            to="/officer/cases"
            className="text-sm text-indigo-600 hover:text-indigo-800 inline-flex items-center"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex space-x-4">
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : recentCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Case ID</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCases.map((caseItem) => (
                  <tr key={caseItem.id} className="text-sm">
                    <td className="py-3 text-gray-600">
                      #{String(caseItem.id).padStart(4, "0")}
                    </td>
                    <td className="py-3 text-gray-900 font-medium">
                      {caseItem.title?.substring(0, 40)}
                      {caseItem.title?.length > 40 ? "..." : ""}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/officer/cases/${caseItem.id}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent cases found.</p>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
