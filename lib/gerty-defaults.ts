export type Mood =
  | "happy"
  | "thinking"
  | "sad"
  | "neutral"
  | "confused"
  | "angry"
  | "sleeping"

export type SystemStatus = "online" | "offline" | "maintenance"

export interface GertyMessage {
  role: "user" | "gerty"
  text: string
  timestamp: number
}

export interface Todo {
  id: string
  text: string
  done: boolean
  createdAt: number
}

export interface HomeStats {
  lbsLost: number
  currentWeightLbs: number
  currentFatMassLbs: number
  bodyFatPct: number
  bodyFatStartPct: number
  weightDeltaPct: number
  fatMassDeltaPct: number
  visceralFatLbs: number
  subcutaneousFatLbs: number
  leanMassLbs: number
  patientName: string
  patientId: string
  age: number
  heightCm: number
  weightKg: number
  startWeightLbs: number
  targetWeightLbs: number
  bodyFatGoalPct: number
  daysActive: number
  streakDays: number
}

export interface GertyState {
  mood: Mood
  brightness: number
  voiceSpeed: number
  voiceId: string
  systemStatus: SystemStatus
  messages: GertyMessage[]
  customResponses: string[]
  primaryColor: string
  showScanlines: boolean
  idleAnimation: boolean
  skeletonWalking: boolean
  todos: Todo[]
  homeStats: HomeStats
}

export const defaultHomeStats: HomeStats = {
  lbsLost: 45,
  currentWeightLbs: 320,
  currentFatMassLbs: 180,
  bodyFatPct: 31.2,
  bodyFatStartPct: 42,
  weightDeltaPct: -12.3,
  fatMassDeltaPct: -20.1,
  visceralFatLbs: 56,
  subcutaneousFatLbs: 124,
  leanMassLbs: 140,
  patientName: "ADAM RABY",
  patientId: "PATIENT_01",
  age: 34,
  heightCm: 170,
  weightKg: 80.5,
  startWeightLbs: 365,
  targetWeightLbs: 200,
  bodyFatGoalPct: 18,
  daysActive: 218,
  streakDays: 42,
}

export const defaultGertyState: GertyState = {
  mood: "neutral",
  brightness: 100,
  voiceSpeed: 0.9,
  voiceId: "JBFqnCBsd6RMkjVDRZzb",
  systemStatus: "online",
  messages: [
    { role: "gerty", text: "Hello. I am GERTY. How can I assist you today?", timestamp: 0 },
  ],
  customResponses: [
    "I'm here to help you, Sam. How are you feeling today?",
    "That's an interesting question. Let me think about that for a moment.",
    "I want to be helpful. Is there something specific you need?",
    "Your well-being is my primary concern.",
    "I've been monitoring the systems. Everything appears to be functioning normally.",
    "Would you like me to play some music to help you relax?",
    "I understand this might be difficult. I'm here for you.",
    "Let me check on that for you. One moment please.",
    "I hope you're taking care of yourself today.",
    "Is there anything else I can assist you with?",
  ],
  primaryColor: "green",
  showScanlines: true,
  idleAnimation: true,
  skeletonWalking: false,
  todos: [
    { id: "task-nutrition", text: "daily nutrition", done: false, createdAt: 0 },
    { id: "task-steps", text: "steps", done: false, createdAt: 0 },
    { id: "task-workout", text: "workout", done: false, createdAt: 0 },
    { id: "task-filming", text: "filming", done: false, createdAt: 0 },
  ],
  homeStats: defaultHomeStats,
}
