import React, { useState, useEffect } from "react";
import { 
  Shield, Eye, TrendingUp, ArrowRight, FileText, Search, Users,
  Clock, CheckCircle, AlertTriangle, BarChart3, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/api";
import CountUp from "react-countup";

const Home = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedCases: 0,
    activeInvestigations: 0,
    averageResponseTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("public/stats/");
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
      icon: <Shield className="w-12 h-12" />,
      title: "Secure & Confidential",
      description: "Your identity is protected with end-to-end encryption. Report with complete peace of mind knowing your information is safe.",
      color: "blue",
    },
    {
      icon: <Eye className="w-12 h-12" />,
      title: "Transparent Tracking",
      description: "Monitor your case progress in real-time with detailed updates and status notifications throughout the investigation process.",
      color: "green",
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Make an Impact",
      description: "Join a growing community of citizens fighting corruption. Your report contributes to meaningful systemic change.",
      color: "purple",
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: "Whistleblower Protection",
      description: "Advanced anonymity features ensure your safety while reporting corruption incidents at any level.",
      color: "red",
    },
  ];

  const StatCard = ({ icon, value, label, color, loading }) => (
    <div className={`p-6 rounded-2xl shadow-lg transition-all duration-500 bg-gradient-to-br from-${color}-50 to-${color}-100 hover:from-${color}-100 hover:to-${color}-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/20`}>
          {icon}
        </div>
        {loading ? (
          <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
        ) : (
          <div className={`text-4xl font-bold text-${color}-700`}>
            <CountUp end={value} duration={1.5} separator="," />
          </div>
        )}
      </div>
      <div className="text-gray-700 font-medium">{label}</div>
    </div>
  );

  const FeatureCard = ({ feature, index }) => (
    <div 
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-3 border-l-4 border-transparent hover:border-${feature.color}-500 animate-fadeIn`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className={`mb-6 p-4 rounded-2xl bg-${feature.color}-50 group-hover:bg-${feature.color}-100 inline-flex transition-colors`}>
        <div className={`text-${feature.color}-600`}>{feature.icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {feature.description}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute -top-20 -left-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Fighting Corruption Together</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Report
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">
                  Corruption
                </span>
                Safely & Securely
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Take a stand against corruption with our secure digital platform. 
                Report incidents confidently with complete anonymity and track case 
                progress in real-time. Together, we can build a more accountable society.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/report"
                  className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 hover:shadow-xl transition-transform duration-300 flex items-center justify-center"
                >
                  <FileText className="mr-3 w-5 h-5" />
                  Report Corruption Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/track-case"
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
                >
                  <Search className="mr-3 w-5 h-5" />
                  Track Your Case
                </Link>
              </div>

              <div className="flex items-center mt-8 text-blue-100">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm">100% Anonymous • End-to-End Encryption • Whistleblower Protection</span>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {/* Floating hero cards */}
                {[
                  { icon: <Shield className="w-8 h-8 text-white mb-3" />, title: "Complete Anonymity", text: "Your identity remains protected throughout the process", rotate: "rotate-3", mt: "mt-0" },
                  { icon: <Eye className="w-8 h-8 text-white mb-3" />, title: "Real-time Updates", text: "Track your case progress with live status updates", rotate: "-rotate-2", mt: "mt-8" },
                  { icon: <TrendingUp className="w-8 h-8 text-white mb-3" />, title: "Make Impact", text: "Join thousands creating meaningful change", rotate: "rotate-2", mt: "mt-0" },
                  { icon: <Users className="w-8 h-8 text-white mb-3" />, title: "Community Trust", text: "Built on transparency and public accountability", rotate: "-rotate-3", mt: "mt-8" }
                ].map((card, i) => (
                  <div key={i} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform ${card.rotate} hover:rotate-0 transition-transform duration-500 hover:scale-105 ${card.mt}`}>
                    {card.icon}
                    <h3 className="text-white font-semibold mb-2">{card.title}</h3>
                    <p className="text-blue-100 text-sm">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Building Trust Through Transparency
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform demonstrates commitment to accountability with real-time statistics and measurable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              value={stats.totalReports}
              label="Reports Submitted"
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              value={stats.resolvedCases}
              label="Cases Resolved"
              color="green"
              loading={loading}
            />
            <StatCard
              icon={<BarChart3 className="w-6 h-6 text-purple-600" />}
              value={stats.activeInvestigations}
              label="Active Investigations"
              color="purple"
              loading={loading}
            />
            <StatCard
              icon={<Clock className="w-6 h-6 text-yellow-600" />}
              value={stats.averageResponseTime}
              label="Avg Response Time (h)"
              color="yellow"
              loading={loading}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Designed for Your Safety and Convenience
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We've built a comprehensive system with features that prioritize your security while ensuring effective reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Your courage to report corruption matters. Join thousands of Ethiopians who are taking a stand for transparency and accountability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/report"
              className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 flex items-center"
            >
              <FileText className="mr-3 w-6 h-6" />
              Report Corruption Now
              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            <Link
              to="/statistics"
              className="group border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center"
            >
              <BarChart3 className="mr-3 w-6 h-6" />
              View Public Statistics
            </Link>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>100% Secure & Encrypted</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              <span>Transparent Process</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>Community Driven</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
