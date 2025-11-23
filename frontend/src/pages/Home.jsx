import React, { useState, useEffect } from "react";
import { Shield, Eye, TrendingUp, ArrowRight, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/api"; // Adjust the import path as necessary    
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedCases: 0,
    activeInvestigations: 0,
    averageResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("public/stats/"); // Replace with actual endpoint
        const data = response.data;
        setStats({
          totalReports: data.total_reports || 0,
          resolvedCases: data.resolved_cases || 0,
          activeInvestigations: data.active_investigations || 0,
          averageResponseTime: data.average_response_time || 0,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <Shield className="text-blue-500 w-10 h-10" />,
      title: "Secure & Confidential",
      description: "Your identity is protected with military-grade encryption. Report with complete peace of mind.",
    },
    {
      icon: <Eye className="text-green-500 w-10 h-10" />,
      title: "Transparent Tracking",
      description: "Monitor your case progress in real-time. Know exactly where your report stands at all times.",
    },
    {
      icon: <TrendingUp className="text-purple-500 w-10 h-10" />,
      title: "Make an Impact",
      description: "Join thousands of citizens fighting corruption. Your report creates meaningful change.",
    },
  ];

  return (
    <div className="home-container font-sans">
      {/* Hero Section */}
      <section className="bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-6 py-24 flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-6">
              Fight <span className="text-blue-600">Corruption</span>.<br />
              Report <span className="text-blue-600">Anonymously</span>.<br />
              Track <span className="text-blue-600">Transparently</span>.
            </h1>
            <p className="text-gray-700 mb-8">
              Take a stand against corruption with our secure digital platform. Report incidents confidently and track case progress in real-time. Together, we can build a more accountable society.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/report"
                className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="mr-2 w-5 h-5" /> Report Corruption Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/track-case"
                className="flex items-center justify-center border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
              >
                <Search className="mr-2 w-5 h-5" /> Track a Case
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
            <div className="absolute top-0 left-0 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center transform -translate-x-1/4 -translate-y-1/4">
              <Shield className="text-blue-500 w-8 h-8 mb-2" />
              <span className="font-semibold">100% Anonymous</span>
            </div>
            <div className="absolute top-1/3 right-0 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center transform translate-x-1/4 -translate-y-1/4">
              <Eye className="text-green-500 w-8 h-8 mb-2" />
              <span className="font-semibold">Real-time Tracking</span>
            </div>
            <div className="absolute bottom-0 left-1/3 bg-white shadow-lg rounded-xl p-6 flex flex-col items-center transform -translate-x-1/4 translate-y-1/4">
              <TrendingUp className="text-purple-500 w-8 h-8 mb-2" />
              <span className="font-semibold">Make Impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Building Trust Through Transparency</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl font-bold text-blue-600">{loading ? "..." : stats.totalReports.toLocaleString()}+</div>
              <div className="mt-2 text-gray-700">Reports Submitted</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl font-bold text-green-600">{loading ? "..." : stats.resolvedCases.toLocaleString()}+</div>
              <div className="mt-2 text-gray-700">Cases Resolved</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl font-bold text-purple-600">{loading ? "..." : stats.activeInvestigations}+</div>
              <div className="mt-2 text-gray-700">Active Investigations</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-3xl font-bold text-yellow-600">{loading ? "..." : stats.averageResponseTime}h</div>
              <div className="mt-2 text-gray-700">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p className="text-gray-700 mb-12">We've built a system you can trust with features designed for your safety and convenience.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="mb-8">Your report matters. Join thousands of Ethiopians fighting corruption today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/report"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center"
            >
              <FileText className="mr-2 w-5 h-5" /> Report Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/statistics"
              className="border border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              View Statistics
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
