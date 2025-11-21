import React from "react";
import CaseList from "./components/CaseList";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold">Corruption Reporting System</h1>
          <p className="text-sm mt-1">View and track reported cases anonymously</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <CaseList />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-700 py-4 mt-6">
        <div className="max-w-5xl mx-auto text-center">
          &copy; {new Date().getFullYear()} Anti-Corruption Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
