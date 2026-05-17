import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `คุณคือผู้ช่วยสกัดข้อมูลจากโน้ตการให้การปรึกษาจิตวิทยาภาษาไทย
ให้ตอบกลับเป็น JSON เท่านั้น ไม่มี markdown code block ไม่มีข้อความอื่น
หาก field ใดไม่พบข้อมูลให้ใส่ "" (string ว่าง)`;

const USER_PROMPT = (docType, text) => `
ประเภทเอกสาร: ${docType === 'individual' ? 'รายบุคคล (Individual)' : 'ครอบครัว (Family)'}

โน้ตเซสชัน:
---
${text}
---

สกัดข้อมูลออกมาเป็น JSON ตาม schema ด้านล่างนี้ทุก field:

{
  "clientID": "รหัสหรือชื่อสมมุติของผู้รับบริการ",
  "sessionNo": "ครั้งที่ (ตัวเลขเท่านั้น)",
  "date": "วันที่ (เขียนเต็ม เช่น 17 พฤษภาคม 2568)",
  "time": "เวลา (เช่น 14:00–15:00 น.)",
  "conversationFormat": "Online หรือ Onsite",
  "basicInfo": [
    "เพศ/อายุ/ชั้นปี/คณะ/สาขา (1 บรรทัด)",
    "ครอบครัว/family composition",
    "ความสามารถพิเศษ/งานอดิเรก"
  ],
  "mainProblem": "(เฉพาะ Individual) ปัญหาหลัก",
  "concerns": "(เฉพาะ Individual) ความกังวล",
  "treatmentHistory": "(เฉพาะ Individual) ประวัติการรักษา",
  "reasonForVisit": "เรื่องราวที่มาขอรับบริการ",
  "intro": "เนื้อหาขั้นเริ่มต้น – Introduction & Building Rapport",
  "explore": "เนื้อหา Explore, Identify Problems, Listen & Analyze",
  "familyHistory": "(เฉพาะ Family) ประวัติความเป็นมาของครอบครัว",
  "understand": "เนื้อหา Understand and Reflect",
  "seekPossibilities": "เนื้อหา Seek Possibilities / Solve Problems",
  "summarize": "เนื้อหาขั้นยุติ",
  "techniques": [
    { "technique": "ชื่อเทคนิค", "detail": "รายละเอียด" }
  ],
  "indTechniques": [
    { "technique": "ชื่อเทคนิค", "detail": "รายละเอียด" }
  ],
  "famTechniques": [
    { "technique": "ชื่อเทคนิค", "detail": "รายละเอียด" }
  ],
  "outcomes": "ผลที่เกิดขึ้นกับผู้รับบริการ",
  "nextSteps": "สิ่งที่จะดำเนินการในครั้งต่อไป",
  "homework": "การบ้าน (N/A ถ้าไม่มี)",
  "nextAppointment": "นัดหมายครั้งต่อไป",
  "analysis": "(เฉพาะ Individual) ข้อพิจารณาและบทวิเคราะห์"
}

หมายเหตุ:
- field "techniques" ใช้สำหรับ Individual; "indTechniques" และ "famTechniques" ใช้สำหรับ Family
- ตอบกลับ JSON เท่านั้น`;

export async function parseSessionNotes(apiKey, docType, text) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: USER_PROMPT(docType, text) }],
  });

  const raw = response.content[0].text.trim();
  return JSON.parse(raw);
}
