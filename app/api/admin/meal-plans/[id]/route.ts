import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '../../../mongodb'
import { MealPlan, MealPlanFormData } from '../../../../../models/mealPlan'
import { authOptions } from '../../../auth/[...nextauth]/route'

// Helper function to verify admin role
async function verifyAdminRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return session.user
}

// GET: Get a specific meal plan
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRole()
    const { id } = await params
    const db = await getDb()
    
    const mealPlan = await db.collection('mealPlans').findOne({ id })
    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }
    
    return NextResponse.json(mealPlan)
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Update a meal plan
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRole()
    const { id } = await params
    const db = await getDb()
    const data: MealPlanFormData = await req.json()

    // Validation
    if (!data.date || !data.breakfast || !data.lunch || !data.dinner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const updateData = {
      date: data.date,
      breakfast: data.breakfast,
      lunch: data.lunch,
      dinner: data.dinner,
      morningSnack: data.morningSnack,
      afternoonSnack: data.afternoonSnack,
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection('mealPlans').updateOne(
      { id },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    const updatedMealPlan = await db.collection('mealPlans').findOne({ id })
    return NextResponse.json(updatedMealPlan)
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Delete a meal plan
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminRole()
    const { id } = await params
    const db = await getDb()

    const result = await db.collection('mealPlans').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Meal plan deleted successfully' })
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 