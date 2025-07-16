import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '../mongodb'
import { ChildRecord } from '../../../models/child'

// GET: List all children
export async function GET() {
  const db = await getDb()
  const children = await db.collection('children').find().toArray()
  return NextResponse.json(children)
}

// POST: Add a new child
export async function POST(req: NextRequest) {
  const db = await getDb()
  const data = await req.json()

  // Validation for new fields
  if (!data.name || typeof data.age !== 'number' || !data.gender || !data.admissionDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const newChild: ChildRecord = {
    id: crypto.randomUUID(),
    name: data.name,
    age: data.age,
    gender: data.gender,
    admissionDate: data.admissionDate,
    photoUrl: data.photoUrl || '',
    caregiver: data.caregiver || '',
    weightHistory: [],
    heightHistory: [],
    mealNotes: [],
    healthRemarks: [],
  }

  await db.collection('children').insertOne(newChild)
  return NextResponse.json(newChild, { status: 201 })
} 