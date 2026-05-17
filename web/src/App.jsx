import React, { useState } from 'react';
import { generateAndDownload } from './utils/generateDoc';

const EMPTY_TECH = { technique: '', detail: '' };

function init() {
  return {
    docType: 'individual',
    clientID: '', sessionNo: '1', date: '', time: '', conversationFormat: 'Online',
    basicInfo: ['', '', ''],
    mainProblem: '', concerns: '', treatmentHistory: '',
    reasonForVisit: '',
    intro: '', explore: '', familyHistory: '', understand: '', seekPossibilities: '', summarize: '',
    techniques: [{ ...EMPTY_TECH }],
    indTechniques: [{ ...EMPTY_TECH }],
    famTechniques: [{ ...EMPTY_TECH }],
    outcomes: '', nextSteps: '', homework: '', nextAppointment: '',
    analysis: '',
  };
}

export default function App() {
  const [d, setD]       = useState(init);
  const [status, setSt] = useState('idle');
  const [err, setErr]   = useState('');

  const set = (k, v) => { setD(p => ({ ...p, [k]: v })); setSt('idle'); };
  const setBI = (i, v) => { const a = [...d.basicInfo]; a[i] = v; set('basicInfo', a); };

  const addTech  = k => set(k, [...d[k], { ...EMPTY_TECH }]);
  const delTech  = (k, i) => { if (d[k].length > 1) set(k, d[k].filter((_, j) => j !== i)); };
  const editTech = (k, i, f, v) => {
    const a = d[k].map((r, j) => j === i ? { ...r, [f]: v } : r);
    set(k, a);
  };

  const isFamily = d.docType === 'family';

  async function generate() {
    setErr('');
    try {
      setSt('loading');
      await generateAndDownload(d);
      setSt('done');
    } catch (e) {
      setErr(e.message);
      setSt('error');
    }
  }

  return (
    <div className="app">
      <header className="hdr">
        <span className="hdr-icon">📄</span>
        <div>
          <div className="hdr-title">Session Formatter</div>
          <div className="hdr-sub">สร้างเอกสารบันทึกการให้การปรึกษา (.docx)</div>
        </div>
      </header>

      <div className="form-wrap">

        {/* ── ประเภทเอกสาร ── */}
        <Block label="ประเภทเอกสาร">
          <div className="type-row">
            <TypeBtn active={!isFamily} onClick={() => set('docType', 'individual')}
              icon="👤" label="รายบุคคล" sub="Individual Counseling" />
            <TypeBtn active={isFamily}  onClick={() => set('docType', 'family')}
              icon="👨‍👩‍👧" label="ครอบครัว" sub="Family Counseling" />
          </div>
        </Block>

        {/* ── ข้อมูล Session ── */}
        <Block label="ข้อมูล Session">
          <div className="grid-3">
            <Field label="ชื่อสมมุติ / Client ID">
              <input value={d.clientID} onChange={e => set('clientID', e.target.value)} placeholder="เช่น A001" />
            </Field>
            <Field label="ครั้งที่">
              <input type="number" min="1" value={d.sessionNo} onChange={e => set('sessionNo', e.target.value)} />
            </Field>
            <Field label="รูปแบบการสนทนา">
              <select value={d.conversationFormat} onChange={e => set('conversationFormat', e.target.value)}>
                <option value="Online">Online</option>
                <option value="Onsite">Onsite</option>
              </select>
            </Field>
          </div>
          <div className="grid-2">
            <Field label="วันที่">
              <input value={d.date} onChange={e => set('date', e.target.value)} placeholder="เช่น 17 พฤษภาคม 2568" />
            </Field>
            <Field label="เวลา">
              <input value={d.time} onChange={e => set('time', e.target.value)} placeholder="เช่น 14:00–15:00 น." />
            </Field>
          </div>
        </Block>

        {/* ── ข้อมูลเบื้องต้น ── */}
        <Block label="ข้อมูลเบื้องต้น">
          <Field label="• เพศ / อายุ / ชั้นปี / คณะ / สาขา">
            <input value={d.basicInfo[0]} onChange={e => setBI(0, e.target.value)}
              placeholder="เช่น เพศหญิง อายุ 20 ปี ชั้นปีที่ 2 คณะจิตวิทยา" />
          </Field>
          <Field label="• ครอบครัว (Family Composition)">
            <input value={d.basicInfo[1]} onChange={e => setBI(1, e.target.value)}
              placeholder="เช่น อยู่กับพ่อ แม่ และน้องสาว 1 คน" />
          </Field>
          <Field label="• ความสามารถพิเศษ / งานอดิเรก">
            <input value={d.basicInfo[2]} onChange={e => setBI(2, e.target.value)}
              placeholder="เช่น ฟังเพลง วาดภาพ" />
          </Field>
        </Block>

        {/* ── สาเหตุ (Individual only) ── */}
        {!isFamily && (
          <Block label="สาเหตุการเข้ามารับบริการปรึกษา" tag="รายบุคคลเท่านั้น">
            <Field label="ปัญหาหลัก">
              <textarea rows={2} value={d.mainProblem} onChange={e => set('mainProblem', e.target.value)} />
            </Field>
            <Field label="ความกังวล">
              <textarea rows={2} value={d.concerns} onChange={e => set('concerns', e.target.value)} />
            </Field>
            <Field label="ประวัติการรักษา">
              <textarea rows={2} value={d.treatmentHistory} onChange={e => set('treatmentHistory', e.target.value)} />
            </Field>
          </Block>
        )}

        {/* ── เรื่องราว ── */}
        <Block label="เรื่องราวที่มาขอรับบริการ">
          <textarea rows={4} value={d.reasonForVisit} onChange={e => set('reasonForVisit', e.target.value)}
            placeholder="บรรยายเรื่องราวที่มาขอรับบริการ" />
        </Block>

        {/* ── กระบวนการ ── */}
        <Block label="กระบวนการ">
          <Stage th="ขั้นเริ่มต้น" en="Introduction & Building Rapport" color="blue">
            <textarea rows={3} value={d.intro} onChange={e => set('intro', e.target.value)} />
          </Stage>

          <Stage th="ขั้นดำเนินการ" color="green">
            <StageItem label="Explore, Identify Problems, Listen & Analyze the Problems">
              <textarea rows={3} value={d.explore} onChange={e => set('explore', e.target.value)} />
            </StageItem>

            {isFamily && (
              <StageItem label="ประวัติความเป็นมาของครอบครัว (Family History)" accent>
                <textarea rows={3} value={d.familyHistory} onChange={e => set('familyHistory', e.target.value)} />
              </StageItem>
            )}

            <StageItem label="Understand and Reflect the Client's Thoughts and Feelings">
              <textarea rows={3} value={d.understand} onChange={e => set('understand', e.target.value)} />
            </StageItem>

            <StageItem label="Seek Possibilities / Solve Problems / Plan to Act">
              <textarea rows={3} value={d.seekPossibilities} onChange={e => set('seekPossibilities', e.target.value)} />
            </StageItem>
          </Stage>

          <Stage th="ขั้นยุติ" en="Exchange point of views and summarize what have been reached" color="red">
            <textarea rows={3} value={d.summarize} onChange={e => set('summarize', e.target.value)} />
          </Stage>
        </Block>

        {/* ── เทคนิค ── */}
        <Block label="เทคนิคและทักษะที่ใช้">
          {!isFamily ? (
            <TechTable rows={d.techniques} k="techniques"
              addTech={addTech} delTech={delTech} editTech={editTech} />
          ) : (
            <>
              <div className="sub-section-label">เทคนิครายบุคคล</div>
              <TechTable rows={d.indTechniques} k="indTechniques"
                addTech={addTech} delTech={delTech} editTech={editTech} />
              <div className="sub-section-label" style={{marginTop:12}}>เทคนิคครอบครัว</div>
              <TechTable rows={d.famTechniques} k="famTechniques"
                addTech={addTech} delTech={delTech} editTech={editTech} />
            </>
          )}
        </Block>

        {/* ── ผลที่เกิดขึ้น ── */}
        <Block label="ผลที่เกิดขึ้นกับผู้รับบริการ">
          <textarea rows={3} value={d.outcomes} onChange={e => set('outcomes', e.target.value)} />
        </Block>

        {/* ── สิ่งที่จะดำเนินการ ── */}
        <Block label="สิ่งที่จะดำเนินการในครั้งต่อไป">
          <textarea rows={3} value={d.nextSteps} onChange={e => set('nextSteps', e.target.value)}
            placeholder="แผนการดำเนินการในครั้งต่อไป" />
          <div className="grid-2">
            <Field label="การบ้าน (Homework)">
              <input value={d.homework} onChange={e => set('homework', e.target.value)} placeholder="N/A ถ้าไม่มี" />
            </Field>
            <Field label="นัดหมายครั้งต่อไป">
              <input value={d.nextAppointment} onChange={e => set('nextAppointment', e.target.value)}
                placeholder="เช่น 24 พฤษภาคม 2568" />
            </Field>
          </div>
        </Block>

        {/* ── บทวิเคราะห์ (Individual only) ── */}
        {!isFamily && (
          <Block label="ข้อพิจารณาและบทวิเคราะห์" tag="รายบุคคลเท่านั้น">
            <textarea rows={5} value={d.analysis} onChange={e => set('analysis', e.target.value)} />
          </Block>
        )}

        {/* ── Actions ── */}
        {err && <div className="error-msg">⚠ {err}</div>}

        <div className="actions">
          <button className="btn-reset" onClick={() => { if (confirm('ล้างข้อมูลทั้งหมด?')) { setD(init()); setSt('idle'); } }}>
            ล้างข้อมูล
          </button>
          <button className="btn-generate" onClick={generate} disabled={status === 'loading'}>
            {status === 'loading' ? '⏳ กำลังสร้าง…'
             : status === 'done'  ? '✅ ดาวน์โหลดสำเร็จ — สร้างใหม่?'
             : '⬇  สร้างไฟล์ .docx'}
          </button>
        </div>

        {status === 'done' && (
          <div className="success-note">ไฟล์ถูกบันทึกใน Downloads ของคุณแล้ว</div>
        )}

      </div>

      <footer className="ftr">น.ส.ธีรติภัสส์ ศรีส่วนธนกุล 6614671026</footer>
    </div>
  );
}

/* ── sub-components ──────────────────────────────────────── */

function Block({ label, tag, children }) {
  return (
    <section className="block">
      <div className="block-header">
        <span className="block-label">{label}</span>
        {tag && <span className="block-tag">{tag}</span>}
      </div>
      <div className="block-body">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
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

function Stage({ th, en, color, children }) {
  return (
    <div className={`stage stage-${color}`}>
      <div className="stage-head">
        <span className="stage-th">{th}</span>
        {en && <span className="stage-en">{en}</span>}
      </div>
      <div className="stage-body">{children}</div>
    </div>
  );
}

function StageItem({ label, accent, children }) {
  return (
    <div className={`stage-item ${accent ? 'accent' : ''}`}>
      <div className="stage-item-label">{label}</div>
      {children}
    </div>
  );
}

function TechTable({ rows, k, addTech, delTech, editTech }) {
  return (
    <div className="tech-wrap">
      <div className="tech-head">
        <span>เทคนิคที่ใช้</span>
        <span>รายละเอียด</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div className="tech-row" key={i}>
          <input value={r.technique} placeholder={`เทคนิคที่ ${i+1}`}
            onChange={e => editTech(k, i, 'technique', e.target.value)} />
          <input value={r.detail} placeholder="รายละเอียด (ถ้ามี)"
            onChange={e => editTech(k, i, 'detail', e.target.value)} />
          <button className="btn-del" onClick={() => delTech(k, i)}>×</button>
        </div>
      ))}
      <button className="btn-add" onClick={() => addTech(k)}>+ เพิ่มเทคนิค</button>
    </div>
  );
}
