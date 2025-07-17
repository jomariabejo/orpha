"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MealPlan } from "../../../models/mealPlan"

export default function MealPlansPage() {
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
      return
    }
    fetchMealPlans()
  }, [session, status, router])

  async function fetchMealPlans() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/meal-plans")
      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/auth/signin")
          return
        }
        throw new Error("Failed to fetch meal plans")
      }
      const data = await res.json()
      setMealPlans(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteMealPlan(id: string) {
    if (!confirm("Are you sure you want to delete this meal plan?")) return
    
    try {
      const res = await fetch(`/api/admin/meal-plans/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete meal plan")
      fetchMealPlans()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function cloneMealPlan(plan: MealPlan) {
    const newName = prompt("Enter a name for the cloned meal plan:", `${plan.name} (Copy)`)
    if (!newName) return
    
    try {
      const res = await fetch(`/api/admin/meal-plans/${plan.id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      })
      if (!res.ok) throw new Error("Failed to clone meal plan")
      fetchMealPlans()
    } catch (err: any) {
      setError(err.message)
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Meal Plan Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage weekly meal plans for children
            </p>
          </div>
          <Link
            href="/admin/meal-plans/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
          >
            Create New Plan
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-300">Loading meal plans...</div>
          </div>
        ) : mealPlans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meal plans yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first meal plan.</p>
            <Link
              href="/admin/meal-plans/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
            >
              Create First Plan
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {plan.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                      {plan.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Week Starting:</span> {new Date(plan.weekStartDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Days:</span> {plan.days.length} days
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Created:</span> {new Date(plan.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/meal-plans/${plan.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/meal-plans/${plan.id}/edit`}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => cloneMealPlan(plan)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Clone
                    </button>
                    <button
                      onClick={() => deleteMealPlan(plan.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 