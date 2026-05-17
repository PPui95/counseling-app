import React, { useState } from 'react';
import { parseSessionNotes } from './utils/parseNotes';
import { generateAndDownload } from './utils/generateDoc';

const EXAMPLE = `ชื่อสมมุติ: มะลิ  ID: A001  ครั้งที่ 2
วันที่ 17 พฤษภาคม 2568  เวลา 14:00–15:00 น.  รูปแบบ: Online

ข้อมูลเบื้องต้น
- เพศหญิง อายุ 20 ปี ชั้นปีที่ 2 คณะจิตวิทยา
- อยู่กับพ่อ แม่ และน้องสาว 1 คน
- งานอดิเรก: ฟังเพลง วาดภาพ

เรื่องราว: มะลิมาพบเพราะรู้สึกเครียดจากการเรียน...

ขั้นเริ่มต้น: ทักทาย สร้างสัมพันธภาพ ถามสารทุกข์สุขดิบ
ขั้นดำเนินการ: สำรวจปัญหา พบว่ามะลิรู้สึกกดดันจากความคาดหวังของครอบครัว
ขั้นยุติ: สรุปสิ่งที่พูดคุยกัน มะลิรู้สึกดีขึ้น

เทคนิค: Active Listening, Reflection of Feeling, Empathy
ผลลัพธ์: มะลิรู้สึกเบาใจขึ้น สามารถระบุความรู้สึกของตัวเองได้ชัดเจน
การบ้าน: จดบันทึกความรู้สึกทุกวัน
นัดหมายครั้งต่อไป: 24 พฤษภาคม 2568`;

export default function App() {
  const [docType, setDocType] = useState('individual');
  const [notes, setNotes]     = useState('');
  const [status, setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleGenerate() {
    if (!notes.trim()) {
      setErrorMsg('กรุณาวางโน้ตเซสชันในช่องด้านบนก่อน');
      return;
    }
    setErrorMsg('');
    try {
      setStatus('parsing');
      const data = parseSessionNotes(notes, docType);

      setStatus('generating');
      await generateAndDownload(data);
      setStatus('done');
    } catch (e) {
      setErrorMsg('เกิดข้อผิดพลาด: ' + e.message);
      setStatus('error');
    }
  }

  const isLoading = status === 'parsing' || status === 'generating';

  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-left">
          <span className="hdr-icon">📄</span>
          <div>
            <div className="hdr-title">Session Formatter</div>
            <div className="hdr-sub">สร้างเอกสารบันทึกการให้การปรึกษา</div>
          </div>
        </div>
        <span className="hdr-badge">ใช้งานในเครื่อง • ไม่ต้อง API</span>
      </header>

      <main className="main">

        {/* Step 1 */}
        <StepCard num={1} title="เลือกประเภทเอกสาร">
          <div className="type-row">
            <TypeBtn active={docType === 'individual'} onClick={() => setDocType('individual')}
              icon="👤" label="รายบุคคล" sub="Individual Counseling" />
            <TypeBtn active={docType === 'family'} onClick={() => setDocType('family')}
              icon="👨‍👩‍👧" label="ครอบครัว" sub="Family Counseling" />
          </div>
        </StepCard>

        {/* Step 2 */}
        <StepCard num={2} title="วางโน้ตเซสชัน">
          <p className="step-hint">
            วางโน้ตในช่องด้านล่าง — ดูตัวอย่างรูปแบบที่แนะนำใน placeholder
          </p>
          <textarea
            className="notes-area"
            placeholder={EXAMPLE}
            value={notes}
            onChange={e => { setNotes(e.target.value); setStatus('idle'); setErrorMsg(''); }}
            rows={14}
          />
        </StepCard>

        {/* Step 3 */}
        <StepCard num={3} title="สร้างไฟล์ Word">
          {errorMsg && <div className="error-msg">⚠ {errorMsg}</div>}

          <button className="gen-btn" onClick={handleGenerate} disabled={isLoading}>
            {status === 'parsing'    && <><Spinner /> กำลังอ่านโน้ต…</>}
            {status === 'generating' && <><Spinner /> กำลังสร้างไฟล์…</>}
            {status === 'done'       && '✅ ดาวน์โหลดสำเร็จ — กดสร้างใหม่ได้เลย'}
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

function TypeBtn({ active, onClick, icon, label, sub }) {
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
