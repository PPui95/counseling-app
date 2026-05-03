export type UserRole = 'counselor' | 'client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface CounselingSession {
  id: string;
  counselorId: string;
  clientId: string;
  clientName: string;
  date: string;
  duration: number;
  presentingProblem: string;
  techniques: string[];
  notes: string;
  followUpPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  avatar?: string;
  totalSessions: number;
  lastSessionDate?: string;
  assignedCounselorId: string;
  createdAt: string;
}

export type AssessmentType = 'PHQ9' | 'GAD7' | 'SWLS';

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  type: AssessmentType;
  answers: number[];
  score: number;
  severity: string;
  interpretation: string;
  takenAt: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  mood: number;
  note?: string;
  recordedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  sentAt: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  counselorId: string;
  clientId: string;
  counselorName: string;
  clientName: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';

export interface PHQ9Result {
  score: number;
  severity: SeverityLevel;
  recommendation: string;
}

export interface GAD7Result {
  score: number;
  severity: SeverityLevel;
  recommendation: string;
}

export interface SWLSResult {
  score: number;
  level: string;
  interpretation: string;
}
