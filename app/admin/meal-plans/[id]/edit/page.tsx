"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MealPlan } from "../../../../../models/mealPlan"

export default function EditMealPlanPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
      return
    }
    fetchMealPlan()
  }, [session, status, router, params.id])

  async function fetchMealPlan() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/meal-plans/${params.id}`)
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/auth/signin")
          return
        }
        if (res.status === 404) {
          setError("Meal plan not found")
          return
        }
        throw new Error("Failed to fetch meal plan")
      }
      const data = await res.json()
      setMealPlan(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-700 dark:text-gray-200 text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || !session.user || (session.user as any).role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-300">Loading meal plan...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">{error || "Meal plan not found"}</div>
            <Link
              href="/admin/meal-plans"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Meal Plans
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Edit Meal Plan
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {mealPlan.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/meal-plans/${mealPlan.id}`}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
            <Link
              href="/admin/meal-plans"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Plans
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400 mb-6">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Edit functionality coming soon
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                For now, you can clone this meal plan and make changes to the copy, or delete and recreate it.
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Link
                href={`/admin/meal-plans/${mealPlan.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Plan
              </Link>
              <Link
                href="/admin/meal-plans"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 