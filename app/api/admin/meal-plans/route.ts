import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '../../mongodb'
import { DailyMealPlanRecord, DailyMealPlanFormData } from '../../../../models/mealPlan'
import { authOptions } from '../../auth/config'

// Helper function to verify admin role
async function verifyAdminRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return session.user
}

// GET: List all meal plans
export async function GET() {
  try {
    await verifyAdminRole()
    const db = await getDb()
    const mealPlans = await db.collection('mealPlans')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json(mealPlans)
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new daily meal plan
export async function POST(req: NextRequest) {
  try {
    const user = await verifyAdminRole()
    const db = await getDb()
    const data: DailyMealPlanFormData = await req.json()

    // Validation - only date is required
    if (!data.date) {
      return NextResponse.json({ error: 'Missing required field: date' }, { status: 400 })
    }

    // Check if at least one meal is provided
    const hasMeals = data.breakfast || data.lunch || data.dinner || data.morningSnack || data.afternoonSnack
    if (!hasMeals) {
      return NextResponse.json({ error: 'At least one meal must be provided' }, { status: 400 })
    }

    const newMealPlan: DailyMealPlanRecord = {
      id: crypto.randomUUID(),
      date: data.date,
      breakfast: data.breakfast,
      lunch: data.lunch,
      dinner: data.dinner,
      morningSnack: data.morningSnack,
      afternoonSnack: data.afternoonSnack,
      createdBy: (user as any).id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      tags: []
    }

    await db.collection('mealPlans').insertOne(newMealPlan)
    return NextResponse.json(newMealPlan, { status: 201 })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 