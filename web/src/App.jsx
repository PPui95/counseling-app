import React, { useState } from 'react';
import { generateAndDownload } from './utils/generateDoc';
import Section from './components/Section';
import TechniqueRows from './components/TechniqueRows';

const EMPTY_TECHNIQUE = { technique: '', detail: '' };

function initState() {
  return {
    docType: 'individual',
    clientID: '',
    sessionNo: '1',
    date: '',
    time: '',
    conversationFormat: 'Online',
    basicInfo: ['', '', ''],
    mainProblem: '',
    concerns: '',
    treatmentHistory: '',
    reasonForVisit: '',
    intro: '',
    explore: '',
    familyHistory: '',
    understand: '',
    seekPossibilities: '',
    summarize: '',
    techniques: [{ ...EMPTY_TECHNIQUE }],
    indTechniques: [{ ...EMPTY_TECHNIQUE }],
    famTechniques: [{ ...EMPTY_TECHNIQUE }],
    outcomes: '',
    nextSteps: '',
    homework: '',
    nextAppointment: '',
    analysis: '',
  };
}

export default function App() {
  const [form, setForm] = useState(initState());
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setDone(false);
  };

  const setBasicInfo = (idx, value) => {
    const arr = [...form.basicInfo];
    arr[idx] = value;
    setForm(f => ({ ...f, basicInfo: arr }));
  };

  const isFamily = form.docType === 'family';

  async function handleGenerate() {
    setLoading(true);
    setDone(false);
    try {
      await generateAndDownload(form);
      setDone(true);
    } catch (e) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    if (confirm('ล้างข้อมูลทั้งหมด?')) {
      setForm(initState());
      setDone(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">📄</div>
          <div>
            <h1>Counseling Session Formatter</h1>
            <p>สร้างเอกสารบันทึกการให้การปรึกษา (.docx)</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Doc type */}
        <Section title="ประเภทเอกสาร" defaultOpen>
          <div className="type-toggle">
            <button
              className={`type-btn ${form.docType === 'individual' ? 'active' : ''}`}
              onClick={() => set('docType', 'individual')}
            >
              Individual Counseling<br />
              <span>(รายบุคคล)</span>
            </button>
            <button
              className={`type-btn ${form.docType === 'family' ? 'active' : ''}`}
              onClick={() => set('docType', 'family')}
            >
              Family Counseling<br />
              <span>(ครอบครัว)</span>
            </button>
          </div>
        </Section>

        {/* Session info */}
        <Section title="ข้อมูล Session" defaultOpen>
          <div className="grid-2">
            <label className="field">
              <span>ชื่อสมมุติ / รหัส (Client ID)</span>
              <input
                value={form.clientID}
                onChange={e => set('clientID', e.target.value)}
                placeholder="เช่น A001"
              />
            </label>
            <label className="field">
              <span>ครั้งที่ (Session No.)</span>
              <input
                type="number"
                min="1"
                value={form.sessionNo}
                onChange={e => set('sessionNo', e.target.value)}
              />
            </label>
            <label className="field">
              <span>วันที่</span>
              <input
                value={form.date}
                onChange={e => set('date', e.target.value)}
                placeholder="เช่น 17 พฤษภาคม 2568"
              />
            </label>
            <label className="field">
              <span>เวลา</span>
              <input
                value={form.time}
                onChange={e => set('time', e.target.value)}
                placeholder="เช่น 14:00 – 15:00 น."
              />
            </label>
            <label className="field">
              <span>รูปแบบการสนทนา</span>
              <select
                value={form.conversationFormat}
                onChange={e => set('conversationFormat', e.target.value)}
              >
                <option value="Online">Online</option>
                <option value="Onsite">Onsite</option>
              </select>
            </label>
          </div>
        </Section>

        {/* Basic info */}
        <Section title="ข้อมูลเบื้องต้น (Basic Info)">
          {['เพศ / อายุ / ชั้นปี / คณะ / สาขา', 'ครอบครัว (Family Composition)', 'ความสามารถพิเศษ / งานอดิเรก'].map((label, i) => (
            <label key={i} className="field">
              <span>{label}</span>
              <input
                value={form.basicInfo[i]}
                onChange={e => setBasicInfo(i, e.target.value)}
                placeholder={`กรอก${label}`}
              />
            </label>
          ))}
        </Section>

        {/* Individual only: สาเหตุ */}
        {!isFamily && (
          <Section title="สาเหตุการเข้ามารับบริการปรึกษา">
            <label className="field">
              <span>ปัญหาหลัก</span>
              <textarea rows={2} value={form.mainProblem} onChange={e => set('mainProblem', e.target.value)} />
            </label>
            <label className="field">
              <span>ความกังวล</span>
              <textarea rows={2} value={form.concerns} onChange={e => set('concerns', e.target.value)} />
            </label>
            <label className="field">
              <span>ประวัติการรักษา</span>
              <textarea rows={2} value={form.treatmentHistory} onChange={e => set('treatmentHistory', e.target.value)} />
            </label>
          </Section>
        )}

        {/* เรื่องราว */}
        <Section title="เรื่องราวที่มาขอรับบริการ">
          <label className="field">
            <span>บรรยายสั้น ๆ</span>
            <textarea rows={4} value={form.reasonForVisit} onChange={e => set('reasonForVisit', e.target.value)} />
          </label>
        </Section>

        {/* กระบวนการ */}
        <Section title="กระบวนการ (Process)">
          <div className="process-stage">
            <div className="stage-tag intro">ขั้นเริ่มต้น</div>
            <p className="stage-sub">Introduction &amp; Building Rapport</p>
            <textarea rows={3} value={form.intro} onChange={e => set('intro', e.target.value)} />
          </div>

          <div className="process-stage">
            <div className="stage-tag explore">ขั้นดำเนินการ</div>
            <p className="stage-sub">Explore, Identify Problems, Listen &amp; Analyze the Problems</p>
            <textarea rows={3} value={form.explore} onChange={e => set('explore', e.target.value)} />

            {isFamily && (
              <>
                <p className="stage-sub mt">ประวัติความเป็นมาของครอบครัว (Family History)</p>
                <textarea rows={3} value={form.familyHistory} onChange={e => set('familyHistory', e.target.value)} />
              </>
            )}

            <p className="stage-sub mt">Understand and Reflect the Client's Thoughts and Feelings</p>
            <textarea rows={3} value={form.understand} onChange={e => set('understand', e.target.value)} />

            <p className="stage-sub mt">Seek Possibilities / Solve Problems / Plan to Act</p>
            <textarea rows={3} value={form.seekPossibilities} onChange={e => set('seekPossibilities', e.target.value)} />
          </div>

          <div className="process-stage">
            <div className="stage-tag end">ขั้นยุติ</div>
            <p className="stage-sub">Exchange point of views and summarize what have been reached</p>
            <textarea rows={3} value={form.summarize} onChange={e => set('summarize', e.target.value)} />
          </div>
        </Section>

        {/* Techniques */}
        <Section title="เทคนิคและทักษะที่ใช้">
          {!isFamily ? (
            <>
              <TechniqueRows
                rows={form.techniques}
                onChange={rows => set('techniques', rows)}
              />
            </>
          ) : (
            <>
              <p className="sub-label">เทคนิครายบุคคล</p>
              <TechniqueRows
                rows={form.indTechniques}
                onChange={rows => set('indTechniques', rows)}
              />
              <p className="sub-label mt">เทคนิคครอบครัว</p>
              <TechniqueRows
                rows={form.famTechniques}
                onChange={rows => set('famTechniques', rows)}
              />
            </>
          )}
        </Section>

        {/* Outcomes */}
        <Section title="ผลที่เกิดขึ้นกับผู้รับบริการ">
          <label className="field">
            <span>ผลลัพธ์</span>
            <textarea rows={3} value={form.outcomes} onChange={e => set('outcomes', e.target.value)} />
          </label>
        </Section>

        {/* Next steps */}
        <Section title="สิ่งที่จะดำเนินการในครั้งต่อไป">
          <label className="field">
            <span>แผนการดำเนินการ</span>
            <textarea rows={3} value={form.nextSteps} onChange={e => set('nextSteps', e.target.value)} />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>การบ้าน (Homework)</span>
              <input
                value={form.homework}
                onChange={e => set('homework', e.target.value)}
                placeholder="N/A ถ้าไม่มี"
              />
            </label>
            <label className="field">
              <span>นัดหมายครั้งต่อไป</span>
              <input
                value={form.nextAppointment}
                onChange={e => set('nextAppointment', e.target.value)}
                placeholder="เช่น 24 พฤษภาคม 2568"
              />
            </label>
          </div>
        </Section>

        {/* Individual only: Analysis */}
        {!isFamily && (
          <Section title="ข้อพิจารณาและบทวิเคราะห์">
            <label className="field">
              <span>บทวิเคราะห์</span>
              <textarea rows={5} value={form.analysis} onChange={e => set('analysis', e.target.value)} />
            </label>
          </Section>
        )}

        {/* Actions */}
        <div className="actions">
          <button className="btn-reset" onClick={handleReset}>ล้างข้อมูล</button>
          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? 'กำลังสร้าง...' : '⬇ สร้างไฟล์ .docx'}
          </button>
        </div>

        {done && (
          <div className="success-banner">
            ✅ ดาวน์โหลดไฟล์เรียบร้อย — ตรวจสอบ Downloads ของคุณ
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span>{new Date().getFullYear()} · น.ส.ธีรติภัสส์ ศรีส่วนธนกุล 6614671026</span>
      </footer>
    </div>
  );
}
