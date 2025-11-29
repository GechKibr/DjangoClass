import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import {
  ArrowLeft,
  FileText,
  Image,
  MessageSquare,
  Clock,
  Save,
  Upload,
  Send,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([]);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const statusOptions = [
    { value: "new", label: "New", color: "blue" },
    { value: "under_review", label: "Under Review", color: "yellow" },
    { value: "investigation", label: "Investigation", color: "purple" },
    { value: "resolved", label: "Resolved", color: "green" },
    { value: "dismissed", label: "Dismissed", color: "gray" },
    { value: "closed", label: "Closed", color: "gray" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "evidence", label: "Evidence", icon: Image },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "activity", label: "Activity Log", icon: Clock },
  ];

  useEffect(() => {
    fetchCaseData();
    fetchOfficers();
  }, [caseId]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`cases/${caseId}/`);
      setCaseData(response.data);
      setNewStatus(response.data.status);
      setNewAssignee(response.data.assigned_to || "");
    } catch (error) {
      console.error("Error fetching case:", error);
      alert("Failed to load case data.");
      navigate("/officer/cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await api.get("accounts/officers/");
      setOfficers(response.data || []);
    } catch (error) {
      console.error("Error fetching officers:", error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === caseData.status) return;
    setSaving(true);
    try {
      await api.post(`cases/${caseId}/change_status/`, { status: newStatus });
      await fetchCaseData();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignment = async () => {
    if (!newAssignee) return;
    setSaving(true);
    try {
      await api.post(`cases/${caseId}/assign/`, { assigned_to: newAssignee });
      await fetchCaseData();
    } catch (error) {
      console.error("Error assigning case:", error);
      alert("Failed to assign case.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post("comments/", {
        case: caseId,
        content: newNote,
        visibility: "private",
      });
      setNewNote("");
      await fetchCaseData();
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post("comments/", {
        case: caseId,
        content: newMessage,
        visibility: "public",
      });
      setNewMessage("");
      await fetchCaseData();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const handleEvidenceUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      await api.post(`cases/${caseId}/add_attachment/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCaseData();
    } catch (error) {
      console.error("Error uploading evidence:", error);
      alert("Failed to upload evidence.");
    } finally {
      setUploadingEvidence(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "bg-blue-100 text-blue-800 border-blue-200",
      under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      investigation: "bg-purple-100 text-purple-800 border-purple-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      dismissed: "bg-gray-100 text-gray-800 border-gray-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Case not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Link
            to="/officer/cases"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Case #{String(caseData.id).padStart(4, "0")}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getStatusColor(
                  caseData.status
                )}`}
              >
                {caseData.status?.replace("_", " ")}
              </span>
              {caseData.severity && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getSeverityColor(
                    caseData.severity
                  )}`}
                >
                  {caseData.severity}
                </span>
              )}
            </div>
            <h2 className="text-lg text-gray-600">{caseData.title}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 p-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Case Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Case Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tracking ID</span>
                      <p className="font-mono text-gray-900">{caseData.tracking_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category</span>
                      <p className="text-gray-900">{caseData.category?.name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location</span>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {caseData.location || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date Submitted</span>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {new Date(caseData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reporter</span>
                      <p className="text-gray-900 flex items-center">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        {caseData.is_anonymous
                          ? "Anonymous"
                          : caseData.reporter_name || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Assigned Officer</span>
                      <p className="text-gray-900">
                        {caseData.assigned_to_name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {caseData.description}
                  </p>
                </div>

                {/* Involved Parties */}
                {caseData.involved_parties && caseData.involved_parties.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Involved Parties
                    </h3>
                    <div className="space-y-3">
                      {caseData.involved_parties.map((party, index) => (
                        <div
                          key={party.id || index}
                          className="bg-white rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{party.name}</p>
                              <p className="text-sm text-gray-500 capitalize">
                                {party.party_type?.replace("_", " ")}
                                {party.position && ` • ${party.position}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-6">
                {/* Status Update */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={saving || newStatus === caseData.status}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Status
                      </>
                    )}
                  </button>
                </div>

                {/* Assignment */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Assign Case</h3>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {officers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.first_name || officer.username}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignment}
                    disabled={saving || !newAssignee}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === "evidence" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Evidence Files</h3>
                <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Evidence
                  <input
                    type="file"
                    multiple
                    onChange={handleEvidenceUpload}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.mp4,.doc,.docx"
                  />
                </label>
              </div>

              {uploadingEvidence && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                  <span className="text-gray-600">Uploading...</span>
                </div>
              )}

              {caseData.attachments && caseData.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {caseData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {attachment.mime_type?.startsWith("image/") ? (
                            <Image className="w-8 h-8 text-blue-500" />
                          ) : (
                            <FileText className="w-8 h-8 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {attachment.file?.split("/").pop() || "File"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.mime_type}
                            </p>
                            <p className="text-xs text-gray-400">
                              Uploaded by {attachment.uploader_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <a
                          href={attachment.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No evidence files uploaded yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === "communication" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Internal Notes */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Internal Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                  {caseData.comments?.filter((c) => c.visibility === "private")
                    .length > 0 ? (
                    <div className="space-y-3">
                      {caseData.comments
                        .filter((c) => c.visibility === "private")
                        .map((note) => (
                          <div
                            key={note.id}
                            className="bg-white rounded-lg p-3 border border-gray-200"
                          >
                            <p className="text-sm text-gray-700">{note.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {note.author_name} •{" "}
                              {new Date(note.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No internal notes yet.
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Public Messages */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  Messages to Reporter
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                  {caseData.comments?.filter((c) => c.visibility === "public")
                    .length > 0 ? (
                    <div className="space-y-3">
                      {caseData.comments
                        .filter((c) => c.visibility === "public")
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-3 ${
                              msg.author === user?.id
                                ? "bg-indigo-100 ml-4"
                                : "bg-white border border-gray-200 mr-4"
                            }`}
                          >
                            <p className="text-sm text-gray-700">{msg.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {msg.author_name} •{" "}
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No messages yet.
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send message to reporter..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Tab */}
          {activeTab === "activity" && <ActivityLog caseId={caseId} />}
        </div>
      </div>
    </div>
  );
};

// Activity Log Component
const ActivityLog = ({ caseId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [caseId]);

  const fetchTimeline = async () => {
    try {
      const response = await api.get(`cases/${caseId}/timeline/`);
      setTimeline(response.data.timeline || []);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      case_created: CheckCircle,
      status_changed: Clock,
      case_assigned: User,
      comment_created: MessageSquare,
      attachment_uploaded: Upload,
      case_updated: Edit,
    };
    return icons[action] || Clock;
  };

  const getActionColor = (action) => {
    const colors = {
      case_created: "bg-green-100 text-green-600",
      status_changed: "bg-blue-100 text-blue-600",
      case_assigned: "bg-purple-100 text-purple-600",
      comment_created: "bg-yellow-100 text-yellow-600",
      attachment_uploaded: "bg-indigo-100 text-indigo-600",
      case_updated: "bg-gray-100 text-gray-600",
    };
    return colors[action] || "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900">Activity Timeline</h3>
      {timeline.length > 0 ? (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {timeline.map((event, index) => {
              const Icon = getActionIcon(event.action);
              return (
                <div key={index} className="relative flex items-start ml-10">
                  <div
                    className={`absolute -left-10 p-2 rounded-full ${getActionColor(
                      event.action
                    )}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {event.action?.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      By {event.user || "System"}
                    </p>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(event.details).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default CaseDetail;
