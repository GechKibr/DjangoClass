import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Statistics from "./pages/Statistics";
import TrackCasePage from "./pages/TrackCasePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";

// Officer Portal Components
import OfficerLayout from "./components/officer/OfficerLayout";
import LoginPage from "./pages/officer/auth/Login";
import OfficerDashboard from "./pages/officer/dashboard/OfficerDashboard";
import CasesList from "./pages/officer/cases/CasesList";
import CreateCase from "./pages/officer/cases/CreateCase";
import CaseDetail from "./pages/officer/cases/CaseDetail";
import UserManagement from "./pages/officer/users/UserManagement";
import AnalyticsPage from "./pages/officer/analytics/AnalyticsPage";
import OfficerProfile from "./pages/officer/profile/OfficerProfile";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/report"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Report />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/statistics"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Statistics />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/track-case"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <TrackCasePage />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <About />
                </main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Contact />
                </main>
                <Footer />
              </div>
            }
          />

          {/* Officer Portal Routes */}
          <Route path="/officer/login" element={<LoginPage />} />

          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <OfficerDashboard />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/cases"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <CasesList />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/cases/new"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <CreateCase />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/cases/:caseId"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <CaseDetail />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/users"
            element={
              <ProtectedRoute adminOnly>
                <OfficerLayout>
                  <UserManagement />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/analytics"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <AnalyticsPage />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/officer/profile"
            element={
              <ProtectedRoute>
                <OfficerLayout>
                  <OfficerProfile />
                </OfficerLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
