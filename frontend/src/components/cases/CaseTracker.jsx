import React, { useState } from "react";
import api from "../../api/api";

const CaseTracker = () => {
  const [trackingId, setTrackingId] = useState("");
  const [caseData, setCaseData] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.get(`public/cases/?tracking_id=${trackingId}`);
      setCaseData(res.data);
    } catch (err) {
      setCaseData({ error: "Tracking ID not found" });
    }
  };

  return (
    <div>
      <h2>Track Case</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Tracking ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} required />
        <button type="submit">Track</button>
      </form>
      {caseData && (
        <div>
          {caseData.error ? (
            <p>{caseData.error}</p>
          ) : (
            <div>
              <p>Title: {caseData.title}</p>
              <p>Status: {caseData.status}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseTracker;
