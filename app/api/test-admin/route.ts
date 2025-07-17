import { NextResponse } from 'next/server
import { getDb } from '../mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const adminUser = await db.collection(users).findOne({ email: admin@example.com' })    
    if (adminUser) {
      return NextResponse.json({
        exists: true, 
        role: adminUser.role,
        name: adminUser.name,
        email: adminUser.email
      })
    } else {
      return NextResponse.json({ exists: false })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database error }, { status: 500 })
  }
} 