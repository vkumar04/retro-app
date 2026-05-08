import {
  defaultGertyState,
  type GertyMessage,
  type GertyState,
  type Mood,
  type SystemStatus,
} from "./gerty-defaults"

export type GertyAction =
  | { type: "setMood"; mood: Mood }
  | { type: "setBrightness"; brightness: number }
  | { type: "setVoiceSpeed"; voiceSpeed: number }
  | { type: "setVoiceId"; voiceId: string }
  | { type: "setSystemStatus"; status: SystemStatus }
  | { type: "addMessage"; message: Omit<GertyMessage, "timestamp"> }
  | { type: "clearMessages" }
  | { type: "addCustomResponse"; response: string }
  | { type: "removeCustomResponse"; index: number }
  | { type: "setPrimaryColor"; color: string }
  | { type: "setShowScanlines"; value: boolean }
  | { type: "setIdleAnimation"; value: boolean }
  | { type: "sendGertyMessage"; text: string }
  | { type: "setSkeletonWalking"; value: boolean }
  | { type: "addTodo"; text: string }
  | { type: "toggleTodo"; id: string }
  | { type: "removeTodo"; id: string }
  | { type: "clearCompletedTodos" }
  | { type: "reset" }

export function applyAction(state: GertyState, action: GertyAction): GertyState {
  switch (action.type) {
    case "setMood":
      return { ...state, mood: action.mood }
    case "setBrightness":
      return { ...state, brightness: action.brightness }
    case "setVoiceSpeed":
      return { ...state, voiceSpeed: action.voiceSpeed }
    case "setVoiceId":
      return { ...state, voiceId: action.voiceId }
    case "setSystemStatus":
      return { ...state, systemStatus: action.status }
    case "addMessage":
      return {
        ...state,
        messages: [...state.messages, { ...action.message, timestamp: Date.now() }],
      }
    case "clearMessages":
      return {
        ...state,
        messages: [
          { role: "gerty", text: "Hello. I am GERTY. How can I assist you today?", timestamp: Date.now() },
        ],
      }
    case "addCustomResponse":
      return { ...state, customResponses: [...state.customResponses, action.response] }
    case "removeCustomResponse":
      return {
        ...state,
        customResponses: state.customResponses.filter((_, i) => i !== action.index),
      }
    case "setPrimaryColor":
      return { ...state, primaryColor: action.color }
    case "setShowScanlines":
      return { ...state, showScanlines: action.value }
    case "setIdleAnimation":
      return { ...state, idleAnimation: action.value }
    case "sendGertyMessage":
      return {
        ...state,
        messages: [...state.messages, { role: "gerty", text: action.text, timestamp: Date.now() }],
      }
    case "setSkeletonWalking":
      return { ...state, skeletonWalking: action.value }
    case "addTodo": {
      const text = action.text.trim()
      if (!text) return state
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      return {
        ...state,
        todos: [...state.todos, { id, text, done: false, createdAt: Date.now() }],
      }
    }
    case "toggleTodo":
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      }
    case "removeTodo":
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.id),
      }
    case "clearCompletedTodos":
      return { ...state, todos: state.todos.filter((t) => !t.done) }
    case "reset":
      return { ...defaultGertyState }
  }
}
