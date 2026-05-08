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
  todos: [],
}
