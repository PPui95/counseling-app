import React, { useState, useEffect } from 'react';
import { parseSessionNotes } from './utils/parseWithClaude';
import { generateAndDownload } from './utils/generateDoc';

const LS_KEY = 'cf_api_key';

export default function App() {
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem(LS_KEY) || '');
  const [showKey, setShowKey]   = useState(false);
  const [docType, setDocType]   = useState('individual');
  const [notes, setNotes]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle | parsing | generating | done | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!apiKey) setShowKey(true);
  }, []);

  function saveKey(k) {
    localStorage.setItem(LS_KEY, k);
    setApiKey(k);
    setShowKey(false);
  }

  async function handleGenerate() {
    if (!apiKey) { setShowKey(true); return; }
    if (!notes.trim()) { setErrorMsg('กรุณาวางโน้ตเซสชันก่อน'); return; }

    setErrorMsg('');
    try {
      setStatus('parsing');
      const data = await parseSessionNotes(apiKey, docType, notes);
      data.docType = docType;

      setStatus('generating');
      await generateAndDownload(data);
      setStatus('done');
    } catch (e) {
      setErrorMsg(e.message || 'เกิดข้อผิดพลาด');
      setStatus('error');
    }
  }

  const isLoading = status === 'parsing' || status === 'generating';

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="hdr">
        <span className="hdr-title">📄 Session Formatter</span>
        <button className="key-btn" onClick={() => setShowKey(v => !v)} title="ตั้งค่า API Key">
          🔑
        </button>
      </header>

      {/* ── API Key panel ── */}
      {showKey && (
        <ApiKeyPanel current={apiKey} onSave={saveKey} onClose={() => apiKey && setShowKey(false)} />
      )}

      {/* ── Main ── */}
      <main className="main">
        {/* Type toggle */}
        <div className="type-row">
          <button
            className={`type-btn ${docType === 'individual' ? 'active' : ''}`}
            onClick={() => setDocType('individual')}
          >
            รายบุคคล
          </button>
          <button
            className={`type-btn ${docType === 'family' ? 'active' : ''}`}
            onClick={() => setDocType('family')}
          >
            ครอบครัว
          </button>
        </div>

        {/* Notes textarea */}
        <label className="notes-label">วางโน้ตเซสชัน</label>
        <textarea
          className="notes-area"
          placeholder="วางโน้ตการให้การปรึกษาที่นี่... (ไม่จำเป็นต้องจัดรูปแบบ)"
          value={notes}
          onChange={e => { setNotes(e.target.value); setStatus('idle'); }}
          rows={16}
        />

        {/* Error */}
        {errorMsg && <div className="error-msg">⚠ {errorMsg}</div>}

        {/* Generate button */}
        <button className="gen-btn" onClick={handleGenerate} disabled={isLoading}>
          {status === 'parsing'    && '⏳ กำลังอ่านโน้ต...'}
          {status === 'generating' && '📄 กำลังสร้างเอกสาร...'}
          {status === 'done'       && '✅ ดาวน์โหลดแล้ว — สร้างใหม่?'}
          {(status === 'idle' || status === 'error') && '⬇ สร้างไฟล์ .docx'}
        </button>

        <p className="hint">
          Claude จะอ่านโน้ตและจัดรูปแบบให้อัตโนมัติ — ไม่ต้องกรอกฟอร์ม
        </p>
      </main>

      <footer className="ftr">น.ส.ธีรติภัสส์ ศรีส่วนธนกุล 6614671026</footer>
    </div>
  );
}

function ApiKeyPanel({ current, onSave, onClose }) {
  const [val, setVal] = useState(current);
  return (
    <div className="key-panel">
      <div className="key-panel-inner">
        <h2>Anthropic API Key</h2>
        <p>Key จะถูกเก็บไว้ในเครื่องของคุณเท่านั้น (localStorage)</p>
        <input
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="sk-ant-..."
          autoFocus
        />
        <div className="key-actions">
          {current && <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>}
          <button className="btn-save" onClick={() => val.trim() && onSave(val.trim())}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
