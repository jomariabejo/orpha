export interface ChildRecord {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  admissionDate: string // ISO date
  photoUrl?: string
  caregiver?: string
  weightHistory: { date: string; weight: number }[]
  heightHistory: { date: string; height: number }[]
  mealNotes: { date: string; note: string }[]
  healthRemarks: { date: string; note: string }[]
} 