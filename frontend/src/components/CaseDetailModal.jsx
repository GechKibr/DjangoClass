import React, { useEffect, useState } from "react";
import { API_BASE } from "../api/api";
import CommentForm from "./CommentForm";
import AttachmentList from "./AttachmentList";

function CaseDetailModal({ caseData, onClose }) {
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/cases/${caseData.id}/comments/`)
      .then(res => res.json())
      .then(data => setComments(data));
    fetch(`${API_BASE}/cases/${caseData.id}/attachments/`)
      .then(res => res.json())
      .then(data => setAttachments(data));
  }, [caseData.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold"
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-2">{caseData.title}</h2>
        <p className="text-gray-700 mb-2">{caseData.description}</p>
        <p className="text-sm text-gray-500 mb-4">
          Reporter: {caseData.is_anonymous ? "Anonymous" : caseData.reporter?.username || "N/A"}
        </p>
        <AttachmentList attachments={attachments} />
        <CommentForm caseId={caseData.id} setComments={setComments} />
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map(c => (
                <li key={c.id} className="p-2 bg-gray-100 rounded">
                  <p className="text-gray-700">{c.content}</p>
                  <span className="text-xs text-gray-500">
                    {c.author?.username} • {new Date(c.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseDetailModal;
