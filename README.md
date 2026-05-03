# จิตใจดี – Counseling Psychology Platform

A full-stack mobile application for counseling psychology services, supporting both counselors and clients with a calming Thai-language UI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo (Expo Router) |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Real-time | Socket.io |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Language | TypeScript (mobile) |

---

## Project Structure

```
counseling-app/
├── mobile/                         # React Native + Expo app
│   ├── app/
│   │   ├── _layout.tsx             # Root layout (AuthProvider)
│   │   ├── index.tsx               # Auth redirect guard
│   │   ├── (auth)/
│   │   │   ├── login.tsx           # Login screen
│   │   │   └── register.tsx        # Registration with role select
│   │   ├── (counselor)/            # Counselor tab navigator
│   │   │   ├── index.tsx           # Dashboard + quick stats
│   │   │   ├── sessions.tsx        # CO records (CRUD + technique tags)
│   │   │   ├── clients.tsx         # Client list + progress dashboard
│   │   │   ├── chat.tsx            # Chat rooms with clients
│   │   │   └── profile.tsx         # Profile + logout
│   │   └── (client)/               # Client tab navigator
│   │       ├── index.tsx           # Home + mood check-in
│   │       ├── assessments.tsx     # PHQ-9 / GAD-7 / SWLS tests
│   │       ├── chat.tsx            # Chat with counselor
│   │       ├── progress.tsx        # Mood chart + assessment trends
│   │       └── profile.tsx         # Profile + logout
│   ├── components/                 # Button, Input, Card, Header, Badge
│   ├── constants/
│   │   ├── Colors.ts               # Mint green / light blue palette
│   │   ├── Thai.ts                 # All Thai language strings
│   │   └── Assessments.ts         # Questions + scoring logic
│   ├── contexts/AuthContext.tsx    # Auth state + SecureStore
│   ├── services/
│   │   ├── api.ts                  # Axios client + all service methods
│   │   └── socket.ts               # Socket.io client helpers
│   └── types/index.ts              # TypeScript types
│
└── backend/                        # Node.js + Express API
    ├── src/
    │   ├── index.js                # Entry: Express + Socket.io server
    │   ├── middleware/auth.js      # JWT authenticate + requireRole
    │   ├── models/
    │   │   ├── db.js               # SQLite singleton
    │   │   └── initDb.js           # Schema + demo data seed
    │   ├── controllers/
    │   │   ├── authController.js   # register / login / me
    │   │   ├── sessionController.js# CRUD counseling sessions
    │   │   ├── clientController.js # Client list + progress data
    │   │   ├── assessmentController.js # Submit + score PHQ9/GAD7/SWLS
    │   │   ├── moodController.js   # Record + retrieve mood entries
    │   │   └── chatController.js   # Chat rooms + messages REST
    │   ├── routes/                 # auth / sessions / clients / assessments / mood / chat / users
    │   └── socket/chatSocket.js    # Socket.io real-time chat handler
    └── database/                   # counseling.db (auto-created)
```

---

## Features

### Counselor (นักจิตวิทยา)
- **CO Records** – Create, edit, delete counseling session notes with date, client, presenting problem, techniques used (tag picker), notes, and follow-up plan
- **Technique Tags** – 10 counseling technique chips (CBT, Mindfulness, Active Listening, Reflection, Reframing, etc.)
- **Client Dashboard** – View all assigned clients with session counts, last session date, and latest PHQ-9 / GAD-7 scores
- **Client Detail** – Drill down into any client's assessment history and session log
- **Chat Rooms** – Threaded messaging with unread badges per client

### Client (ผู้รับบริการ)
- **PHQ-9** – 9-item depression screening with automatic scoring and Thai severity labels
- **GAD-7** – 7-item anxiety screening with scoring and clinical recommendations
- **SWLS** – 5-item life satisfaction scale with 7-point Likert options
- **Mood Check-in** – Daily 5-point emoji mood tracker from home screen
- **Progress Dashboard** – 14-day mood bar chart + PHQ-9 / GAD-7 trend visualization
- **Chat** – Real-time messaging with assigned counselor (typing indicator, auto-reply demo)

### Shared
- Role-based login (Counselor / Client)
- JWT + SecureStore token persistence
- Thai language UI throughout
- Soft color palette: mint green `#4CAF8E`, light blue `#7BB8D4`, warm white `#F7FAFA`

---

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator / Android Emulator or Expo Go app

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # Edit JWT_SECRET if needed
npm start
# Server: http://localhost:3001
# DB auto-created and seeded on first run
```

### 2. Mobile App

```bash
cd mobile
npm install
# Update EXPO_PUBLIC_API_URL in .env if backend is not on localhost
npx expo start
# Press 'i' for iOS, 'a' for Android, or scan QR with Expo Go
```

### Environment Variables (mobile)

Create `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001
```

For physical device, replace `localhost` with your machine's LAN IP (e.g. `http://192.168.1.100:3001/api`).

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Counselor | counselor@demo.com | demo1234 |
| Client | client@demo.com | demo1234 |
| Client 2 | client2@demo.com | demo1234 |

The demo accounts come pre-loaded with:
- 2 counseling session records
- PHQ-9 and GAD-7 assessment results
- 14 days of mood tracking data
- Chat messages between counselor and client 1

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/sessions` | Counselor | List CO records |
| POST | `/api/sessions` | Counselor | Create CO record |
| PUT | `/api/sessions/:id` | Counselor | Update CO record |
| DELETE | `/api/sessions/:id` | Counselor | Delete CO record |
| GET | `/api/clients` | Counselor | List clients with stats |
| GET | `/api/clients/:id` | Counselor | Client detail + history |
| GET | `/api/clients/:id/progress` | Counselor | Assessment + mood trends |
| GET | `/api/assessments` | Client | Get my assessment results |
| POST | `/api/assessments` | Client | Submit assessment |
| GET | `/api/mood` | Client | Get mood entries |
| POST | `/api/mood` | Client | Record mood |
| GET | `/api/chat/rooms` | Any | List chat rooms |
| GET | `/api/chat/rooms/:id/messages` | Any | Get messages |
| POST | `/api/chat/rooms/:id/messages` | Any | Send message |

## Socket.io Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_room` | Client → Server | `{ roomId }` |
| `send_message` | Client → Server | `{ roomId, content }` |
| `new_message` | Server → Client | Full message object |
| `typing` | Client → Server | `{ roomId, isTyping }` |
| `user_typing` | Server → Client | `{ userId, userName, isTyping }` |

---

## Assessment Scoring Reference

### PHQ-9 (0–27)
| Score | Thai Severity |
|-------|--------------|
| 0–4 | น้อยมาก |
| 5–9 | น้อย |
| 10–14 | ปานกลาง |
| 15–19 | ค่อนข้างรุนแรง |
| 20–27 | รุนแรง |

### GAD-7 (0–21)
| Score | Thai Severity |
|-------|--------------|
| 0–4 | น้อยมาก |
| 5–9 | น้อย |
| 10–14 | ปานกลาง |
| 15–21 | รุนแรง |

### SWLS (5–35)
| Score | Thai Level |
|-------|-----------|
| 5–9 | ต่ำมาก |
| 10–14 | ต่ำ |
| 15–19 | ปานกลาง-ต่ำ |
| 20–24 | ปานกลาง |
| 25–29 | สูง |
| 30–35 | สูงมาก |
