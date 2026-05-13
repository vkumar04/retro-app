// Mock macro data for ADAM_RABY. Swap to a real source when ready.

export const MACRO_GOALS = {
  protein: 220, // g
  carbs: 200, // g
  fat: 70, // g
  calories: 2310, // kcal
} as const

export const TODAY = {
  protein: 42,
  carbs: -123, // already over (carb surplus shown as 0 left)
  fat: 3,
  calories: -306, // calories surplus
}

// "Left" semantics: goal - consumed. Negative = went over.
export const LEFT = {
  calories: MACRO_GOALS.calories - 1944, // 366 if 1944 consumed
  protein: MACRO_GOALS.protein - 195,
  carbs: MACRO_GOALS.carbs - 178,
  fat: MACRO_GOALS.fat - 58,
}

export const CONSUMED = {
  calories: 1944,
  protein: 195,
  carbs: 178,
  fat: 58,
}

export const COLORS = {
  calories: "oklch(0.78 0.22 145)", // green
  protein: "oklch(0.78 0.2 165)", // teal-green
  carbs: "oklch(0.85 0.2 85)", // amber
  fat: "oklch(0.65 0.2 200)", // cyan
} as const

export const STREAK = 38

export type MacroKey = "calories" | "protein" | "carbs" | "fat"

// Day strip — 7 days centered on today (today is index 5)
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const
export type DayStatus = "past" | "today" | "future"

export const DAY_STRIP: ReadonlyArray<{
  label: string
  date: number
  status: DayStatus
}> = (() => {
  const today = new Date()
  const out: Array<{ label: string; date: number; status: DayStatus }> = []
  for (let offset = -5; offset <= 1; offset++) {
    const d = new Date(today)
    d.setDate(today.getDate() + offset)
    const dow = (d.getDay() + 6) % 7 // Mon=0..Sun=6
    out.push({
      label: DAY_LABELS[dow],
      date: d.getDate(),
      status: offset < 0 ? "past" : offset === 0 ? "today" : "future",
    })
  }
  return out
})()

// Recently logged — flat list, newest first
export const RECENT_LOG: ReadonlyArray<{
  name: string
  time: string
  protein: number
  carbs: number
  fat: number
}> = [
  { name: "PEANUT BUTTER", time: "15:15", protein: 4, carbs: 3, fat: 8 },
  { name: "GREEK YOGURT · ALMONDS", time: "15:45", protein: 28, carbs: 14, fat: 14 },
  { name: "CHICKEN BOWL · RICE · PEPPERS", time: "12:30", protein: 55, carbs: 70, fat: 14 },
  { name: "EGG WHITES + OATS + BERRIES", time: "08:10", protein: 38, carbs: 52, fat: 6 },
  { name: "WHEY ISOLATE + CREATINE", time: "06:45", protein: 28, carbs: 4, fat: 1 },
]

export function calorieFor(p: number, c: number, f: number): number {
  return p * 4 + c * 4 + f * 9
}
