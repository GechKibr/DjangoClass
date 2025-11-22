import React, { useState } from "react";
import api from "../../api/api";

const SubmitCase = () => {
  const [form, setForm] = useState({ title: "", description: "" });
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post("cases/", form);
      setMessage(`Case submitted! Tracking ID: ${res.data.tracking_id}`);
    } catch (err) {
      setMessage("Error submitting case");
    }
  };

  return (
    <div>
      <h2>Submit Case</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Case Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <button type="submit">Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default SubmitCase;
