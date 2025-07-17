import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '../../../../mongodb'
import { DailyMealPlanRecord } from '../../../../../../models/mealPlan'
import { authOptions } from '../../../../auth/config'

// Helper function to verify admin role
async function verifyAdminRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return session.user
}

// POST: Clone a meal plan
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminRole()
    const { id } = await params
    const db = await getDb()
    const data = await req.json()

    // Get the original meal plan
    const originalPlan = await db.collection('mealPlans').findOne({ id })
    if (!originalPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    // Create new meal plan with updated data
    const newMealPlan: DailyMealPlanRecord = {
      id: crypto.randomUUID(),
      date: data.date || originalPlan.date,
      breakfast: originalPlan.breakfast,
      lunch: originalPlan.lunch,
      dinner: originalPlan.dinner,
      morningSnack: originalPlan.morningSnack,
      afternoonSnack: originalPlan.afternoonSnack,
      createdBy: (user as any).id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      tags: originalPlan.tags || []
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