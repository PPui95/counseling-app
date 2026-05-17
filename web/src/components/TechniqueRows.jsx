import React from 'react';

const EMPTY = { technique: '', detail: '' };

export default function TechniqueRows({ rows, onChange }) {
  function update(idx, key, value) {
    const next = rows.map((r, i) => i === idx ? { ...r, [key]: value } : r);
    onChange(next);
  }

  function addRow() {
    onChange([...rows, { ...EMPTY }]);
  }

  function removeRow(idx) {
    if (rows.length === 1) return;
    onChange(rows.filter((_, i) => i !== idx));
  }

  return (
    <div className="tech-table">
      <div className="tech-header">
        <span>เทคนิคที่ใช้</span>
        <span>รายละเอียด</span>
        <span></span>
      </div>
      {rows.map((row, i) => (
        <div className="tech-row" key={i}>
          <input
            value={row.technique}
            onChange={e => update(i, 'technique', e.target.value)}
            placeholder={`เทคนิคที่ ${i + 1}`}
          />
          <input
            value={row.detail}
            onChange={e => update(i, 'detail', e.target.value)}
            placeholder="รายละเอียด"
          />
          <button className="btn-remove" onClick={() => removeRow(i)} title="ลบแถว">×</button>
        </div>
      ))}
      <button className="btn-add-row" onClick={addRow}>+ เพิ่มเทคนิค</button>
    </div>
  );
}
