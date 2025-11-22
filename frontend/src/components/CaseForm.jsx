import React, { useState } from 'react';
import { API_BASE } from '../api/api';


function CaseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/cases/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Created case:', data);
        setTitle('');
        setDescription('');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
      <button type="submit">Add Case</button>
    </form>
  );
}

export default CaseForm;
