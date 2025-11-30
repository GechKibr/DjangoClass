import React from "react";
import { Link } from "react-router-dom";
const About = () => {
  const technologies = [
    {
      category: "Frontend",
      items: ["React.js", "Tailwind CSS", "JavaScript (ES6+)", "HTML5", "Vite"],
    },
    {
      category: "Backend",
      items: ["Django REST Framework", "Python", "PostgreSQL", "RESTful APIs"],
    },
    {
      category: "Tools & Libraries",
      items: ["Git", "Recharts", "Axios", "React Router", "Django ORM"],
    },
  ];

  const projectFeatures = [
    {
      title: "Secure Reporting",
      description:
        "Citizens can report corruption incidents anonymously with encrypted data protection",
      icon: "🔒",
    },
    {
      title: "Real-time Tracking",
      description:
        "Track case progress transparently with status updates and timeline visualization",
      icon: "📊",
    },
    {
      title: "Data Analytics",
      description:
        "Comprehensive dashboard with charts and statistics for transparency and insights",
      icon: "📈",
    },
    {
      title: "Multi-user System",
      description:
        "Role-based access for citizens, investigators, and administrators",
      icon: "👥",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About Our Project
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              A Final Year Project by Computer Science Students at University of
              Gondar
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Corruption Reporting and Case Tracking Management System
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              This project addresses the critical need for a transparent,
              secure, and efficient digital platform to combat corruption in
              Ethiopia. Our system empowers citizens to report corruption
              incidents confidently while providing authorities with tools to
              manage and track cases effectively.
            </p>
          </div>

          {/* Problem Statement */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Problem Statement
            </h3>
            <div className="prose prose-lg text-gray-600">
              <p>
                Corruption remains one of the major challenges weakening social,
                political, and economic development in Ethiopia. Traditional
                reporting methods through physical letters, phone calls, or
                office visits are often:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Slow and inefficient</li>
                <li>Prone to bias and manipulation</li>
                <li>Lack transparency in case progress</li>
                <li>Compromise reporter confidentiality</li>
                <li>Result in lost or ignored complaints</li>
              </ul>
              <p className="mt-4">
                This erodes public trust and discourages citizens from reporting
                corruption incidents.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Technology Stack
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {tech.category}
                  </h4>
                  <ul className="space-y-2">
                    {tech.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-center text-gray-600"
                      >
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* University Information */}
          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                University of Gondar
              </h3>
              <p className="text-lg text-gray-700 mb-4">
                Department of Computer Science
              </p>
              <p className="text-gray-600">
                Final Year Project - Bachelor of Science in Computer Science
              </p>
              <p className="text-gray-600 mt-2">Academic Year: November 2025</p>
            </div>
          </div>

          {/* Project Impact */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Expected Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  For Citizens:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Secure and anonymous reporting channels</li>
                  <li>• Transparent case tracking</li>
                  <li>• Increased trust in anti-corruption efforts</li>
                  <li>• Empowerment to fight corruption</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  For Authorities:
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Efficient case management</li>
                  <li>• Data-driven insights</li>
                  <li>• Improved investigation processes</li>
                  <li>• Enhanced public trust and credibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Link
              to="/report"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mr-4"
            >
              Report Corruption
            </Link>
            <Link
              to="/statistics"
              className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              View Statistics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
