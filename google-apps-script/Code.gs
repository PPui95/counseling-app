// ============================================================
// จิตใจดี — Google Apps Script Backend
// วิธีใช้: Deploy เป็น Web App (Execute as: Me, Anyone can access)
// ============================================================

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const params = e.parameter;
    // Support payload param (GET with JSON) or POST body
    let body = {};
    if (params.payload) {
      try { body = JSON.parse(decodeURIComponent(params.payload)); } catch(ex) {}
    } else if (e.postData) {
      try { body = JSON.parse(e.postData.contents); } catch(ex) {}
    }
    const action = params.action || body.action;

    let result;
    switch (action) {
      case 'login':       result = login(body); break;
      case 'register':    result = register(body); break;
      case 'getSessions': result = getSessions(body); break;
      case 'saveSession': result = saveSession(body); break;
      case 'getClients':  result = getClients(body); break;
      case 'getMoods':    result = getMoods(body); break;
      case 'saveMood':    result = saveMood(body); break;
      case 'getAssessments': result = getAssessments(body); break;
      case 'saveAssessment': result = saveAssessment(body); break;
      case 'getMessages': result = getMessages(body); break;
      case 'saveMessage': result = saveMessage(body); break;
      case 'initSheet':   result = initSheet(); break;
      default: result = { error: 'Unknown action: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Sheet helpers ──────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function appendRow(sheet, headers, obj) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : '');
  sheet.appendRow(row);
}

function generateId() {
  return Utilities.getUuid();
}

// ── Init ───────────────────────────────────────────────────

function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheets = {
    Users:       ['id','email','fullName','role','passwordHash','createdAt'],
    Sessions:    ['id','counselorId','clientId','clientName','date','duration','presentingProblem','techniques','notes','followUpPlan','createdAt'],
    Assessments: ['id','userId','type','answers','score','severity','interpretation','takenAt'],
    Moods:       ['id','userId','mood','note','recordedAt'],
    Messages:    ['id','roomId','senderId','senderName','senderRole','content','sentAt'],
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#3DAA7D').setFontColor('#FFFFFF');
    }
  });

  // Seed demo users
  const userSheet = ss.getSheetByName('Users');
  const existing = sheetToObjects(userSheet);
  if (existing.length === 0) {
    appendRow(userSheet, ['id','email','fullName','role','passwordHash','createdAt'], {
      id: generateId(), email: 'counselor@example.com', fullName: 'ดร.สมใจ วงศ์จันทร์',
      role: 'counselor', passwordHash: 'password123', createdAt: new Date().toISOString()
    });
    appendRow(userSheet, ['id','email','fullName','role','passwordHash','createdAt'], {
      id: generateId(), email: 'client@example.com', fullName: 'คุณมานี รักดี',
      role: 'client', passwordHash: 'password123', createdAt: new Date().toISOString()
    });
  }

  return { success: true, message: 'Sheets initialized!' };
}

// ── Auth ───────────────────────────────────────────────────

function login(body) {
  const { email, password } = body;
  const sheet = getSheet('Users');
  const users = sheetToObjects(sheet);
  const user = users.find(u => u.email === email && u.passwordHash === password);
  if (!user) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
  const { passwordHash, ...safeUser } = user;
  return { success: true, user: safeUser, token: 'gs_' + user.id };
}

function register(body) {
  const { email, password, fullName, role } = body;
  const sheet = getSheet('Users');
  const users = sheetToObjects(sheet);
  if (users.find(u => u.email === email)) return { error: 'อีเมลนี้ถูกใช้แล้ว' };
  const newUser = {
    id: generateId(), email, fullName, role,
    passwordHash: password, createdAt: new Date().toISOString()
  };
  appendRow(sheet, ['id','email','fullName','role','passwordHash','createdAt'], newUser);
  const { passwordHash, ...safeUser } = newUser;
  return { success: true, user: safeUser, token: 'gs_' + newUser.id };
}

// ── Sessions ───────────────────────────────────────────────

function getSessions(body) {
  const { counselorId, clientId } = body;
  const sheet = getSheet('Sessions');
  let sessions = sheetToObjects(sheet);
  if (counselorId) sessions = sessions.filter(s => s.counselorId === counselorId);
  if (clientId) sessions = sessions.filter(s => s.clientId === clientId);
  sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { success: true, sessions };
}

function saveSession(body) {
  const sheet = getSheet('Sessions');
  const headers = ['id','counselorId','clientId','clientName','date','duration','presentingProblem','techniques','notes','followUpPlan','createdAt'];
  const session = {
    id: body.id || generateId(),
    counselorId: body.counselorId,
    clientId: body.clientId,
    clientName: body.clientName,
    date: body.date,
    duration: body.duration,
    presentingProblem: body.presentingProblem,
    techniques: Array.isArray(body.techniques) ? body.techniques.join(',') : body.techniques,
    notes: body.notes,
    followUpPlan: body.followUpPlan,
    createdAt: body.createdAt || new Date().toISOString()
  };

  // Update if exists
  const data = sheet.getDataRange().getValues();
  const headers2 = data[0];
  const idCol = headers2.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === session.id) {
      const row = headers.map(h => session[h] !== undefined ? session[h] : '');
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return { success: true, session };
    }
  }

  appendRow(sheet, headers, session);
  return { success: true, session };
}

// ── Clients ────────────────────────────────────────────────

function getClients(body) {
  const { counselorId } = body;
  const userSheet = getSheet('Users');
  const sessionSheet = getSheet('Sessions');
  const users = sheetToObjects(userSheet).filter(u => u.role === 'client');
  const sessions = sheetToObjects(sessionSheet).filter(s => s.counselorId === counselorId);

  const clients = users.map(u => {
    const userSessions = sessions.filter(s => s.clientId === u.id);
    const lastSession = userSessions.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      totalSessions: userSessions.length,
      lastSessionDate: lastSession ? lastSession.date : null,
      createdAt: u.createdAt
    };
  });
  return { success: true, clients };
}

// ── Moods ──────────────────────────────────────────────────

function getMoods(body) {
  const { userId } = body;
  const sheet = getSheet('Moods');
  let moods = sheetToObjects(sheet).filter(m => m.userId === userId);
  moods.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
  return { success: true, moods };
}

function saveMood(body) {
  const sheet = getSheet('Moods');
  const headers = ['id','userId','mood','note','recordedAt'];
  const mood = {
    id: generateId(),
    userId: body.userId,
    mood: body.mood,
    note: body.note || '',
    recordedAt: body.recordedAt || new Date().toISOString()
  };
  appendRow(sheet, headers, mood);
  return { success: true, mood };
}

// ── Assessments ────────────────────────────────────────────

function getAssessments(body) {
  const { userId } = body;
  const sheet = getSheet('Assessments');
  let assessments = sheetToObjects(sheet).filter(a => a.userId === userId);
  assessments.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
  return { success: true, assessments };
}

function saveAssessment(body) {
  const sheet = getSheet('Assessments');
  const headers = ['id','userId','type','answers','score','severity','interpretation','takenAt'];
  const assessment = {
    id: generateId(),
    userId: body.userId,
    type: body.type,
    answers: Array.isArray(body.answers) ? body.answers.join(',') : body.answers,
    score: body.score,
    severity: body.severity,
    interpretation: body.interpretation,
    takenAt: body.takenAt || new Date().toISOString()
  };
  appendRow(sheet, headers, assessment);
  return { success: true, assessment };
}

// ── Messages ───────────────────────────────────────────────

function getMessages(body) {
  const { roomId } = body;
  const sheet = getSheet('Messages');
  let messages = sheetToObjects(sheet).filter(m => m.roomId === roomId);
  messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
  return { success: true, messages };
}

function saveMessage(body) {
  const sheet = getSheet('Messages');
  const headers = ['id','roomId','senderId','senderName','senderRole','content','sentAt'];
  const message = {
    id: generateId(),
    roomId: body.roomId,
    senderId: body.senderId,
    senderName: body.senderName,
    senderRole: body.senderRole,
    content: body.content,
    sentAt: body.sentAt || new Date().toISOString()
  };
  appendRow(sheet, headers, message);
  return { success: true, message };
}
