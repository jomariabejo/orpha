import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '../../mongodb'

export async function GET(_req: NextRequest, { params }: { params: { childId: string } }) {
  const db = await getDb()
  const child = await db.collection('children').findOne({ id: params.childId })
  if (!child) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(child)
}

export async function PATCH(req: NextRequest, { params }: { params: { childId: string } }) {
  const db = await getDb()
  const childId = params.childId
  const data = await req.json()
  const update: any = {}

  if (data.weight && data.date) {
    update.$push = { weightHistory: { date: data.date, weight: data.weight } }
  } else if (data.height && data.date) {
    update.$push = { heightHistory: { date: data.date, height: data.height } }
  } else if (data.mealNote && data.date) {
    update.$push = { mealNotes: { date: data.date, note: data.mealNote } }
  } else if (data.healthRemark && data.date) {
    update.$push = { healthRemarks: { date: data.date, note: data.healthRemark } }
  } else {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await db.collection('children').findOneAndUpdate(
    { id: childId },
    update,
    { returnDocument: 'after' }
  )
  if (!result || !result.value) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(result.value)
} 