import React, { useState, useEffect } from 'react';
import { parseSessionNotes } from './utils/parseWithClaude';
import { generateAndDownload } from './utils/generateDoc';

const LS_KEY = 'cf_api_key';

const EXAMPLE_NOTES = `ตัวอย่าง (ลบทิ้งแล้ววางโน้ตจริง):

ชื่อสมมุติ: มะลิ  ID: A001  ครั้งที่ 2
วันที่ 17 พฤษภาคม 2568  เวลา 14:00–15:00 น.  รูปแบบ: Online

ข้อมูลเบื้องต้น
- เพศหญิง อายุ 20 ปี ชั้นปีที่ 2 คณะจิตวิทยา สาขาจิตวิทยาการปรึกษา
- อยู่กับพ่อ แม่ และน้องสาว 1 คน
- งานอดิเรก: ฟังเพลง วาดภาพ

เรื่องราว: มะลิมาพบเพราะรู้สึกเครียดจากการเรียนและความสัมพันธ์กับเพื่อน...

ขั้นเริ่มต้น: ทักทาย สร้างสัมพันธภาพ ถามสารทุกข์สุขดิบ...
ขั้นดำเนินการ: สำรวจปัญหา พบว่ามะลิรู้สึกกดดันจากความคาดหวังของครอบครัว...
ขั้นยุติ: สรุปสิ่งที่พูดคุยกัน มะลิรู้สึกดีขึ้น...

เทคนิค: Active Listening, Reflection of Feeling, Empathy
ผลลัพธ์: มะลิรู้สึกเบาใจขึ้น สามารถระบุความรู้สึกของตัวเองได้ชัดเจน
การบ้าน: จดบันทึกความรู้สึกทุกวัน
นัดหมายครั้งต่อไป: 24 พฤษภาคม 2568`;

export default function App() {
  const [apiKey, setApiKey]   = useState(() => localStorage.getItem(LS_KEY) || '');
  const [docType, setDocType] = useState('individual');
  const [notes, setNotes]     = useState('');
  const [status, setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const hasKey = Boolean(apiKey);

  async function handleGenerate() {
    if (!hasKey) { setShowKeyModal(true); return; }
    if (!notes.trim()) { setErrorMsg('กรุณาวางโน้ตเซสชันในช่องด้านบน'); return; }

    setErrorMsg('');
    try {
      setStatus('parsing');
      const data = await parseSessionNotes(apiKey, docType, notes);
      data.docType = docType;

      setStatus('generating');
      await generateAndDownload(data);
      setStatus('done');
    } catch (e) {
      const msg = e.message?.includes('401')
        ? 'API Key ไม่ถูกต้อง — กรุณาตรวจสอบและบันทึกใหม่'
        : (e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  const isLoading = status === 'parsing' || status === 'generating';

  return (
    <div className="app">
      {showKeyModal && (
        <KeyModal
          current={apiKey}
          onSave={k => { localStorage.setItem(LS_KEY, k); setApiKey(k); setShowKeyModal(false); }}
          onClose={() => setShowKeyModal(false)}
          canClose={hasKey}
        />
      )}

      {/* Header */}
      <header className="hdr">
        <div className="hdr-left">
          <span className="hdr-icon">📄</span>
          <div>
            <div className="hdr-title">Session Formatter</div>
            <div className="hdr-sub">สร้างเอกสารบันทึกการให้การปรึกษา</div>
          </div>
        </div>
        <button className="key-chip" onClick={() => setShowKeyModal(true)}>
          {hasKey ? '✅ พร้อมใช้งาน' : '⚠️ ยังไม่ตั้งค่า API Key'}
        </button>
      </header>

      <main className="main">

        {/* ── Step 1 ── */}
        <StepCard num={1} title="เลือกประเภทเอกสาร" done={true}>
          <div className="type-row">
            <TypeBtn
              active={docType === 'individual'}
              onClick={() => setDocType('individual')}
              label="รายบุคคล"
              sub="Individual Counseling"
              icon="👤"
            />
            <TypeBtn
              active={docType === 'family'}
              onClick={() => setDocType('family')}
              label="ครอบครัว"
              sub="Family Counseling"
              icon="👨‍👩‍👧"
            />
          </div>
        </StepCard>

        {/* ── Step 2 ── */}
        <StepCard num={2} title="วางโน้ตเซสชัน">
          <p className="step-hint">
            วางโน้ตที่จดไว้ในช่องด้านล่าง — ไม่ต้องจัดรูปแบบ AI จะอ่านและจัดให้เอง
          </p>
          <textarea
            className="notes-area"
            placeholder={EXAMPLE_NOTES}
            value={notes}
            onChange={e => { setNotes(e.target.value); setStatus('idle'); setErrorMsg(''); }}
            rows={14}
          />
        </StepCard>

        {/* ── Step 3 ── */}
        <StepCard num={3} title="สร้างไฟล์ Word">
          {!hasKey && (
            <div className="key-warn">
              ⚠️ ยังไม่ได้ตั้งค่า API Key —{' '}
              <button className="link-btn" onClick={() => setShowKeyModal(true)}>
                คลิกเพื่อตั้งค่าตอนนี้
              </button>
            </div>
          )}

          {errorMsg && <div className="error-msg">⚠ {errorMsg}</div>}

          <button className="gen-btn" onClick={handleGenerate} disabled={isLoading}>
            {status === 'parsing'    && <><Spinner /> กำลังให้ AI อ่านโน้ต…</>}
            {status === 'generating' && <><Spinner /> กำลังสร้างไฟล์ Word…</>}
            {status === 'done'       && '✅ ดาวน์โหลดสำเร็จ — กดสร้างอีกครั้ง'}
            {(status === 'idle' || status === 'error') && '⬇  สร้างไฟล์ .docx'}
          </button>

          {status === 'done' && (
            <div className="success-note">
              ไฟล์ถูกบันทึกใน <strong>Downloads</strong> ของคุณแล้ว
            </div>
          )}
        </StepCard>

      </main>

      <footer className="ftr">น.ส.ธีรติภัสส์ ศรีส่วนธนกุล 6614671026</footer>
    </div>
  );
}

function StepCard({ num, title, children }) {
  return (
    <div className="step-card">
      <div className="step-header">
        <span className="step-num">{num}</span>
        <span className="step-title">{title}</span>
      </div>
      <div className="step-body">{children}</div>
    </div>
  );
}

function TypeBtn({ active, onClick, label, sub, icon }) {
  return (
    <button className={`type-btn ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="type-icon">{icon}</span>
      <span className="type-label">{label}</span>
      <span className="type-sub">{sub}</span>
    </button>
  );
}

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

function KeyModal({ current, onSave, onClose, canClose }) {
  const [val, setVal] = useState(current);

  return (
    <div className="modal-bg" onClick={canClose ? onClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>🔑 ตั้งค่า API Key</h2>

        <div className="modal-explain">
          <p><strong>API Key คืออะไร?</strong><br />
          รหัสที่ให้เครื่องมือนี้เชื่อมต่อกับ AI (Claude) เพื่ออ่านโน้ตของคุณ</p>

          <p><strong>ได้มาจากไหน?</strong><br />
          สมัครฟรีที่{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
            console.anthropic.com
          </a>
          {' '}→ เลือก <em>API Keys</em> → <em>Create Key</em></p>

          <p><strong>ปลอดภัยไหม?</strong><br />
          Key เก็บเฉพาะในเบราว์เซอร์ของคุณ ไม่ส่งไปไหนนอกจาก Anthropic โดยตรง</p>
        </div>

        <input
          type="password"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="sk-ant-api03-..."
          autoFocus
          onKeyDown={e => e.key === 'Enter' && val.trim() && onSave(val.trim())}
        />

        <div className="modal-actions">
          {canClose && (
            <button className="btn-cancel" onClick={onClose}>ยกเลิก</button>
          )}
          <button
            className="btn-save"
            disabled={!val.trim()}
            onClick={() => val.trim() && onSave(val.trim())}
          >
            บันทึกและใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
}
