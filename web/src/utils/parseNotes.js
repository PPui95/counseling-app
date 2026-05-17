// Local Thai session note parser — no API needed

const HEADER_PATTERNS = [
  /ข้อมูลเบื้องต้น/,
  /สาเหตุการเข้ามารับบริการ/,
  /ปัญหาหลัก/,
  /ความกังวล/,
  /ประวัติการรักษา/,
  /เรื่องราวที่มาขอรับ|เรื่องราว/,
  /กระบวนการ/,
  /ขั้นเริ่มต้น|เริ่มต้น/,
  /ขั้นดำเนินการ|ดำเนินการ/,
  /Explore|สำรวจ|วิเคราะห์ปัญหา/i,
  /Family\s*History|ประวัติครอบครัว|ประวัติความเป็นมาของครอบครัว/i,
  /Understand|Reflect|สะท้อน|เข้าใจความรู้สึก/i,
  /Seek|แสวงหา|วางแผน|แก้ปัญหา/i,
  /ขั้นยุติ|ยุติ/,
  /เทคนิค/,
  /ผลที่เกิดขึ้น|ผลลัพธ์/,
  /สิ่งที่จะดำเนินการ|ครั้งต่อไป/,
  /การบ้าน/,
  /นัดหมาย/,
  /ข้อพิจารณา|บทวิเคราะห์/,
];

function findSection(text, startPatterns, stopAtPatterns = HEADER_PATTERNS) {
  let matchIdx = -1;
  let headerEnd = -1;

  for (const p of startPatterns) {
    const m = text.search(p);
    if (m !== -1 && (matchIdx === -1 || m < matchIdx)) {
      matchIdx = m;
      const lineEnd = text.indexOf('\n', m);
      headerEnd = lineEnd === -1 ? text.length : lineEnd + 1;
    }
  }

  if (matchIdx === -1) return '';

  const content = text.slice(headerEnd);
  let endIdx = content.length;

  for (const p of stopAtPatterns) {
    const e = content.search(p);
    if (e > 0 && e < endIdx) endIdx = e;
  }

  return content.slice(0, endIdx).trim();
}

function extractInline(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function extractBullets(block) {
  return block
    .split('\n')
    .map(l => l.replace(/^[\s•\-*–]+/, '').trim())
    .filter(Boolean);
}

function parseTechniques(block) {
  if (!block) return [{ technique: '', detail: '' }];

  // Try "เทคนิค: A, B, C" on one line
  const oneLine = block.replace(/\n/g, ' ').trim();
  const items = oneLine.split(/[,،、]/).map(s => s.trim()).filter(Boolean);
  if (items.length > 0 && items[0].length < 80) {
    return items.map(t => ({ technique: t, detail: '' }));
  }

  // Try line-by-line "1. Technique — detail" or "- Technique: detail"
  return block
    .split('\n')
    .map(l => l.replace(/^[\d\.\-\s•]+/, '').trim())
    .filter(Boolean)
    .map(l => {
      const sep = l.match(/[:\-–—]\s+(.+)/);
      if (sep) {
        return { technique: l.slice(0, sep.index).trim(), detail: sep[1].trim() };
      }
      return { technique: l, detail: '' };
    });
}

export function parseSessionNotes(text, docType) {
  const result = {
    docType,
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
    techniques: [{ technique: '', detail: '' }],
    indTechniques: [{ technique: '', detail: '' }],
    famTechniques: [{ technique: '', detail: '' }],
    outcomes: '',
    nextSteps: '',
    homework: '',
    nextAppointment: '',
    analysis: '',
  };

  // ── Metadata ────────────────────────────────────────────────────────────

  // Client ID: "ID: A001" or "ID(A001)" or "รหัส: A001"
  result.clientID = extractInline(text, [
    /ID\s*[:(（]\s*([^)\s）,\n_]+)/i,
    /รหัส\s*[:(]\s*([^\s,\n]+)/,
    /ชื่อสมมุติ[^:：]*[:：]\s*([^\s,\n]+)/,
  ]);

  // Session number
  result.sessionNo = extractInline(text, [
    /ครั้งที่\s*(\d+)/,
    /Session\s+no\.?\s*(\d+)/i,
    /Session\s+(\d+)/i,
  ]) || '1';

  // Date: look after "วันที่"
  result.date = extractInline(text, [
    /วันที่\s+([^\n_]+?)(?:\s{2,}|\s*เวลา|\s*รูปแบบ|_)/,
    /วันที่\s*[:：]\s*([^\n,_]+)/,
  ]);

  // Time: look after "เวลา"
  const rawTime = extractInline(text, [
    /เวลา\s+([^\n_]+?)(?:\s{2,}|\s*รูปแบบ|\s*น\.|_)/,
    /เวลา\s*[:：]\s*([^\n,_]+)/,
  ]);
  result.time = rawTime.replace(/_+/g, '').trim();

  // Format
  if (/Onsite|on.site|ออนไซต์/i.test(text)) result.conversationFormat = 'Onsite';

  // ── Basic info bullets ───────────────────────────────────────────────────
  const basicBlock = findSection(text, [/ข้อมูลเบื้องต้น/]);
  if (basicBlock) {
    const bullets = extractBullets(basicBlock);
    result.basicInfo = [
      bullets[0] || '',
      bullets[1] || '',
      bullets[2] || '',
    ];
  }

  // ── Individual: reason section ───────────────────────────────────────────
  result.mainProblem = findSection(text, [/ปัญหาหลัก\s*[:：]/], HEADER_PATTERNS)
    || extractInline(text, [/ปัญหาหลัก\s*[:：]\s*([^\n]+)/]);

  result.concerns = findSection(text, [/ความกังวล\s*[:：]/], HEADER_PATTERNS)
    || extractInline(text, [/ความกังวล\s*[:：]\s*([^\n]+)/]);

  result.treatmentHistory = findSection(text, [/ประวัติการรักษา\s*[:：]/], HEADER_PATTERNS)
    || extractInline(text, [/ประวัติการรักษา\s*[:：]\s*([^\n]+)/]);

  // ── Reason for visit ─────────────────────────────────────────────────────
  result.reasonForVisit = findSection(
    text, [/เรื่องราวที่มาขอรับบริการ/, /เรื่องราว\s*[:：]/]
  ) || extractInline(text, [/เรื่องราว\s*[:：]\s*([^\n]+)/]);

  // ── Process stages ───────────────────────────────────────────────────────
  result.intro = findSection(
    text, [/ขั้นเริ่มต้น\s*[:：]?/, /Introduction.*Rapport/i]
  ) || extractInline(text, [/ขั้นเริ่มต้น\s*[:：]\s*([^\n]+)/]);

  result.explore = findSection(
    text, [/ขั้นดำเนินการ\s*[:：]?/, /Explore.*Problems/i, /สำรวจปัญหา/]
  ) || extractInline(text, [/ขั้นดำเนินการ\s*[:：]\s*([^\n]+)/]);

  result.familyHistory = findSection(
    text, [/Family\s*History/i, /ประวัติครอบครัว/, /ประวัติความเป็นมาของครอบครัว/]
  );

  result.understand = findSection(
    text, [/Understand.*Reflect/i, /สะท้อน/, /เข้าใจความรู้สึก/]
  ) || extractInline(text, [/(?:Understand|สะท้อน)\s*[:：]\s*([^\n]+)/i]);

  result.seekPossibilities = findSection(
    text, [/Seek\s*Possibilities/i, /แสวงหา/, /วางแผน/]
  ) || extractInline(text, [/(?:Seek|วางแผน)\s*[:：]\s*([^\n]+)/i]);

  result.summarize = findSection(
    text, [/ขั้นยุติ\s*[:：]?/, /Exchange.*summarize/i]
  ) || extractInline(text, [/ขั้นยุติ\s*[:：]\s*([^\n]+)/]);

  // ── Techniques ───────────────────────────────────────────────────────────
  const techBlock = findSection(text, [/เทคนิค\s*[:：]?/, /Technique/i]);
  const parsedTechs = parseTechniques(
    techBlock || extractInline(text, [/เทคนิค\s*[:：]\s*([^\n]+)/])
  );

  if (docType === 'individual') {
    result.techniques = parsedTechs.length ? parsedTechs : [{ technique: '', detail: '' }];
  } else {
    // For family: split techniques evenly or put all in individual section
    const half = Math.ceil(parsedTechs.length / 2);
    result.indTechniques = parsedTechs.slice(0, half).length
      ? parsedTechs.slice(0, half)
      : [{ technique: '', detail: '' }];
    result.famTechniques = parsedTechs.slice(half).length
      ? parsedTechs.slice(half)
      : [{ technique: '', detail: '' }];
  }

  // ── Outcomes ─────────────────────────────────────────────────────────────
  result.outcomes = findSection(
    text, [/ผลที่เกิดขึ้น/, /ผลลัพธ์\s*[:：]?/]
  ) || extractInline(text, [/ผล(?:ที่เกิดขึ้น|ลัพธ์)\s*[:：]\s*([^\n]+)/]);

  // ── Next steps ───────────────────────────────────────────────────────────
  result.nextSteps = findSection(
    text, [/สิ่งที่จะดำเนินการ/, /แผนการ(?:ครั้ง)?ต่อไป/]
  );

  result.homework = extractInline(text, [
    /การบ้าน\s*[:：]\s*([^\n]+)/,
    /homework\s*[:：]\s*([^\n]+)/i,
  ]) || 'N/A';

  result.nextAppointment = extractInline(text, [
    /นัดหมาย(?:ครั้งต่อไป)?\s*[:：]\s*([^\n]+)/,
    /นัด(?:ครั้ง)?ต่อไป\s*[:：]\s*([^\n]+)/,
  ]);

  // ── Analysis (Individual only) ───────────────────────────────────────────
  result.analysis = findSection(
    text, [/ข้อพิจารณา/, /บทวิเคราะห์/]
  );

  return result;
}
