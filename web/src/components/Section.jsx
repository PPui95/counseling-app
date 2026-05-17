import React, { useState } from 'react';

export default function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`card ${open ? 'open' : ''}`}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className="chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="card-body">{children}</div>}
    </div>
  );
}
