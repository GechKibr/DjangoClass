import React, { useState } from "react";
import { API_BASE } from "../api/api";

function CommentForm({ caseId, setComments }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/comments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case: caseId, content }),
    })
      .then(res => res.json())
      .then(newComment => {
        setComments(prev => [newComment, ...prev]);
        setContent("");
      });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Post
      </button>
    </form>
  );
}

export default CommentForm;
