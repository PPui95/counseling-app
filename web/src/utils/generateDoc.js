import {
  Document, Packer, Paragraph, TextRun, Header,
  AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, LevelFormat,
} from 'docx';
import { saveAs } from 'file-saver';

const FONT  = 'AngsanaUPC';
const TITLE = 36;
const BODY  = 32;
const HDR   = 28;

const TABLE_WIDTH = 8306;
const COL1 = 3000;
const COL2 = 5306;

const OWNER = 'น.ส.ธีรติภัสส์ ศรีส่วนธนกุล 6614671026';

// ── helpers ──────────────────────────────────────────────────────────────────

function borders() {
  const s = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
  return { top: s, bottom: s, left: s, right: s };
}

function margins() {
  return { top: 60, bottom: 60, left: 108, right: 108 };
}

function p(text, { bold = false, align = AlignmentType.LEFT, size = BODY } = {}) {
  return new Paragraph({
    alignment: align,
    children: [new TextRun({ text: text ?? '', bold, size, font: FONT })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    children: [new TextRun({ text: text ?? '', size: BODY, font: FONT })],
  });
}

function empty() {
  return new Paragraph({ children: [new TextRun({ text: '', size: BODY, font: FONT })] });
}

function section(text) {
  return p(text, { bold: true });
}

function stageLabel(thai, english) {
  return [
    p(thai, { bold: true }),
    p(english),
  ];
}

function cell(text, { span = 1, shaded = false, bold = false } = {}) {
  return new TableCell({
    columnSpan: span,
    shading: shaded ? { fill: 'D5E8F0', type: ShadingType.CLEAR, color: 'auto' } : undefined,
    borders: borders(),
    margins: margins(),
    children: [new Paragraph({
      children: [new TextRun({ text: text ?? '', bold, size: BODY, font: FONT })],
    })],
  });
}

function tableHeaderRow() {
  return new TableRow({
    children: [
      cell('เทคนิคที่ใช้', { shaded: true, bold: true }),
      cell('รายละเอียด', { shaded: true, bold: true }),
    ],
  });
}

function techniqueRow(num, technique, detail) {
  return new TableRow({
    children: [
      cell(`${num}. ${technique ?? ''}`),
      cell(detail ?? ''),
    ],
  });
}

function subHeaderRow(text) {
  return new TableRow({
    children: [cell(text, { span: 2, shaded: true, bold: true })],
  });
}

function makeTechTableIndividual(techniques) {
  const dataRows = techniques
    .filter(t => t.technique || t.detail)
    .map((t, i) => techniqueRow(i + 1, t.technique, t.detail));

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL1, COL2],
    rows: [tableHeaderRow(), ...dataRows],
  });
}

function makeTechTableFamily(indTechs, famTechs) {
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL1, COL2],
    rows: [
      tableHeaderRow(),
      subHeaderRow('เทคนิครายบุคคล'),
      ...indTechs.filter(t => t.technique || t.detail).map((t, i) => techniqueRow(i + 1, t.technique, t.detail)),
      subHeaderRow('เทคนิคครอบครัว'),
      ...famTechs.filter(t => t.technique || t.detail).map((t, i) => techniqueRow(i + 1, t.technique, t.detail)),
    ],
  });
}

function makeHeader(sessionNo, clientID) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({
        text: `[${OWNER}]_Session ${sessionNo}_[${clientID}]`,
        size: HDR,
        font: FONT,
      })],
    })],
  });
}

const PAGE_PROPS = {
  page: {
    size: { width: 11906, height: 16838 },
    margin: { top: 1440, right: 1800, bottom: 1440, left: 1800 },
  },
};

const NUMBERING_CONFIG = {
  config: [{
    reference: 'bullets',
    levels: [{
      level: 0,
      format: LevelFormat.BULLET,
      text: '•',
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  }],
};

// ── Individual ────────────────────────────────────────────────────────────────

function buildIndividualChildren(d) {
  const fmt = d.conversationFormat || 'Online';
  const children = [
    // Title
    p('บันทึกการให้การปรึกษา รายบุคคล(Individual Counseling)', {
      bold: true, size: TITLE, align: AlignmentType.CENTER,
    }),
    // Line 2
    p(`ชื่อสมมุติของผู้รับบริการให้การปรึกษา_______ID(${d.clientID})________ ครั้งที่___Session no. ${d.sessionNo}______`),
    // Line 3
    p(`วันที่___${d.date}___________________เวลา____${d.time}________รูปแบบการสนทนา __${fmt}___`),
    empty(),

    // ข้อมูลเบื้องต้น
    section('ข้อมูลเบื้องต้น'),
    ...d.basicInfo.filter(Boolean).map(b => bullet(b)),
    empty(),

    // สาเหตุการเข้ามารับบริการปรึกษา
    section('สาเหตุการเข้ามารับบริการปรึกษา'),
    d.mainProblem      && p(`ปัญหาหลัก: ${d.mainProblem}`),
    d.concerns         && p(`ความกังวล: ${d.concerns}`),
    d.treatmentHistory && p(`ประวัติการรักษา: ${d.treatmentHistory}`),
    empty(),

    // เรื่องราว
    section('เรื่องราวที่มาขอรับบริการ'),
    p(d.reasonForVisit),
    empty(),

    // กระบวนการ
    section('กระบวนการ'),
    ...stageLabel('ขั้นเริ่มต้น', 'Introduction & Building Rapport'),
    p(d.intro),
    empty(),
    ...stageLabel('ขั้นดำเนินการ', 'Explore, Identify Problems, Listen & Analyze the Problems'),
    p(d.explore),
    empty(),
    p('Understand and Reflect the Client\'s Thoughts and Feelings'),
    p(d.understand),
    empty(),
    p('Seek Possibilities / Solve Problems / Plan to Act'),
    p(d.seekPossibilities),
    empty(),
    ...stageLabel('ขั้นยุติ', 'Exchange point of views and summarize what have been reached'),
    p(d.summarize),
    empty(),

    // เทคนิค
    section('เทคนิคและทักษะที่ใช้'),
    makeTechTableIndividual(d.techniques),
    empty(),

    // ผลที่เกิดขึ้น
    section('ผลที่เกิดขึ้นกับผู้รับบริการ'),
    p(d.outcomes),
    empty(),

    // สิ่งที่จะดำเนินการ
    section('สิ่งที่จะดำเนินการในครั้งต่อไป'),
    p(d.nextSteps),
    p(`การบ้าน: ${d.homework || 'N/A'}`),
    p(`นัดหมายครั้งต่อไป: ${d.nextAppointment || ''}`),
    empty(),

    // ข้อพิจารณา (Individual only)
    section('ข้อพิจารณาและบทวิเคราะห์'),
    p(d.analysis),
  ];

  return children.filter(Boolean);
}

// ── Family ────────────────────────────────────────────────────────────────────

function buildFamilyChildren(d) {
  const fmt = d.conversationFormat || 'Online';
  const children = [
    // Title
    p('บันทึกการให้การปรึกษาครอบครัว(Family Counseling)', {
      bold: true, size: TITLE, align: AlignmentType.CENTER,
    }),
    // Line 2
    p(`ชื่อสมมุติของผู้รับบริการให้การปรึกษา_______ID(${d.clientID})________ ครั้งที่___Session no. ${d.sessionNo}______`),
    // Line 3
    p(`วันที่___${d.date}___________________เวลา____${d.time}________รูปแบบการสนทนา __${fmt}___`),
    empty(),

    // ข้อมูลเบื้องต้น
    section('ข้อมูลเบื้องต้น'),
    ...d.basicInfo.filter(Boolean).map(b => bullet(b)),
    empty(),

    // เรื่องราว
    section('เรื่องราวที่มาขอรับบริการ'),
    p(d.reasonForVisit),
    empty(),

    // กระบวนการ
    section('กระบวนการ'),
    ...stageLabel('ขั้นเริ่มต้น', 'Introduction & Building Rapport'),
    p(d.intro),
    empty(),
    ...stageLabel('ขั้นดำเนินการ', 'Explore, Identify Problems, Listen & Analyze the Problems'),
    p(d.explore),
    empty(),
    // Family History (Family only)
    section('ประวัติความเป็นมาของครอบครัว (Family History)'),
    p(d.familyHistory),
    empty(),
    p('Understand and Reflect the Client\'s Thoughts and Feelings'),
    p(d.understand),
    empty(),
    p('Seek Possibilities / Solve Problems / Plan to Act'),
    p(d.seekPossibilities),
    empty(),
    ...stageLabel('ขั้นยุติ', 'Exchange point of views and summarize what have been reached'),
    p(d.summarize),
    empty(),

    // เทคนิค (Family: 2 sub-sections)
    section('เทคนิคและทักษะที่ใช้'),
    makeTechTableFamily(d.indTechniques, d.famTechniques),
    empty(),

    // ผลที่เกิดขึ้น
    section('ผลที่เกิดขึ้นกับผู้รับบริการ'),
    p(d.outcomes),
    empty(),

    // สิ่งที่จะดำเนินการ
    section('สิ่งที่จะดำเนินการในครั้งต่อไป'),
    p(d.nextSteps),
    p(`การบ้าน: ${d.homework || 'N/A'}`),
    p(`นัดหมายครั้งต่อไป: ${d.nextAppointment || ''}`),
  ];

  return children.filter(Boolean);
}

// ── export ────────────────────────────────────────────────────────────────────

export async function generateAndDownload(data) {
  const children = data.docType === 'individual'
    ? buildIndividualChildren(data)
    : buildFamilyChildren(data);

  const doc = new Document({
    numbering: NUMBERING_CONFIG,
    sections: [{
      properties: PAGE_PROPS,
      headers: { default: makeHeader(data.sessionNo, data.clientID) },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const typeTag = data.docType === 'individual' ? 'Individual' : 'Family';
  saveAs(blob, `${data.clientID}_Session${data.sessionNo}_${typeTag}.docx`);
}
