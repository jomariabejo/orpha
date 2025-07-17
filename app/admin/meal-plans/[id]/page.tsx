"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MealPlan, Nutrient } from "../../../../models/mealPlan"

export default function MealPlanViewPage({ params }: { params: { id: string } }) {
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

  const handlePrint = () => {
    window.print()
  }

  const getDayName = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' })
  }

  const getDateString = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const calculateDailyNutrients = (day: any) => {
    const meals = Object.values(day.meals).filter(Boolean)
    return meals.reduce((total: any, meal: any) => {
      Object.keys(meal.nutrients).forEach(key => {
        total[key] = (total[key] || 0) + (meal.nutrients[key] || 0)
      })
      return total
    }, {}) as Nutrient
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {mealPlan.name}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Week starting {new Date(mealPlan.weekStartDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Print Plan
            </button>
            <Link
              href={`/admin/meal-plans/${mealPlan.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Edit Plan
            </Link>
            <Link
              href="/admin/meal-plans"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Back to Plans
            </Link>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {mealPlan.name}
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Week starting {new Date(mealPlan.weekStartDate).toLocaleDateString()}
          </p>
          {mealPlan.description && (
            <p className="text-center text-gray-600 italic">{mealPlan.description}</p>
          )}
        </div>

        {/* Plan Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {mealPlan.description && (
              <div className="mb-6 print:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-400">{mealPlan.description}</p>
              </div>
            )}

            {/* Weekly Schedule */}
            <div className="space-y-6">
              {mealPlan.days.map((day, dayIndex) => {
                const dailyNutrients = calculateDailyNutrients(day)
                const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'] as const
                
                return (
                  <div key={day.date} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {getDayName(day.date)} - {getDateString(day.date)}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Calories: {dailyNutrients.calories || 0}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {mealTypes.map((mealType) => {
                        const meal = day.meals[mealType]
                        return (
                          <div key={mealType} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900 dark:text-white capitalize mb-2">
                              {mealType}
                            </h4>
                            {meal ? (
                              <div className="space-y-2">
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {meal.name}
                                  </h5>
                                  {meal.description && (
                                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                      {meal.description}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  <div>Age: {meal.ageRange}</div>
                                  {meal.prepTime && <div>Prep: {meal.prepTime} min</div>}
                                  {meal.servingSize && <div>Serving: {meal.servingSize}</div>}
                                  <div>Calories: {meal.nutrients.calories}</div>
                                </div>

                                {meal.ingredients.length > 0 && meal.ingredients[0] && (
                                  <div>
                                    <h6 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                                      Ingredients:
                                    </h6>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                      {meal.ingredients.map((ingredient, index) => (
                                        <li key={index} className="flex items-start">
                                          <span className="mr-1">•</span>
                                          <span>{ingredient}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {meal.notes && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                                    Note: {meal.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 dark:text-gray-500 text-sm italic">
                                No meal planned
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Daily Nutrition Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        Daily Nutrition Summary:
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>Calories: {dailyNutrients.calories || 0}</div>
                        <div>Protein: {dailyNutrients.protein || 0}g</div>
                        <div>Carbs: {dailyNutrients.carbs || 0}g</div>
                        <div>Fat: {dailyNutrients.fat || 0}g</div>
                        <div>Fiber: {dailyNutrients.fiber || 0}g</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Plan Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div>
                  <span className="font-medium">Created:</span> {new Date(mealPlan.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(mealPlan.updatedAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    mealPlan.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {mealPlan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 