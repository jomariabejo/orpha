"use client"

import { useEffect, useState, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DailyMealPlanRecord, Meal } from "../../../../models/mealPlan"

export default function MealPlanViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [mealPlan, setMealPlan] = useState<DailyMealPlanRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
      return
    }
    fetchMealPlan()
  }, [session, status, router, id])

  async function fetchMealPlan() {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/meal-plans/${id}`)
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

  const calculateDailyNutrients = (meals: (Meal | undefined)[]) => {
    const validMeals = meals.filter(Boolean) as Meal[]
    return validMeals.reduce((total, meal) => {
      total.calories += meal.nutrients.calories || 0
      total.protein += meal.nutrients.protein || 0
      total.carbs += meal.nutrients.carbs || 0
      total.fat += meal.nutrients.fat || 0
      total.fiber += meal.nutrients.fiber || 0
      total.vitaminA += meal.nutrients.vitaminA || 0
      total.vitaminC += meal.nutrients.vitaminC || 0
      total.vitaminD += meal.nutrients.vitaminD || 0
      total.calcium += meal.nutrients.calcium || 0
      total.iron += meal.nutrients.iron || 0
      return total
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0
    })
  }

  const getMealCount = () => {
    if (!mealPlan) return 0
    let count = 0
    if (mealPlan.breakfast) count++
    if (mealPlan.lunch) count++
    if (mealPlan.dinner) count++
    if (mealPlan.morningSnack) count++
    if (mealPlan.afternoonSnack) count++
    return count
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

  const meals = [
    { key: 'breakfast', label: 'Breakfast', meal: mealPlan.breakfast },
    { key: 'lunch', label: 'Lunch', meal: mealPlan.lunch },
    { key: 'dinner', label: 'Dinner', meal: mealPlan.dinner },
    { key: 'morningSnack', label: 'Morning Snack', meal: mealPlan.morningSnack },
    { key: 'afternoonSnack', label: 'Afternoon Snack', meal: mealPlan.afternoonSnack }
  ]

  const dailyNutrients = calculateDailyNutrients(meals.map(m => m.meal))

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {getDayName(mealPlan.date)} - {getDateString(mealPlan.date)}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Daily Meal Plan
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
            {getDayName(mealPlan.date)} - {getDateString(mealPlan.date)}
          </h1>
          <p className="text-center text-gray-600 mb-4">
            Daily Meal Plan
          </p>
        </div>

        {/* Plan Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Daily Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Daily Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Meals:</span>
                  <div className="text-gray-900 dark:text-white">{getMealCount()}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Calories:</span>
                  <div className="text-gray-900 dark:text-white">{dailyNutrients.calories}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Protein:</span>
                  <div className="text-gray-900 dark:text-white">{dailyNutrients.protein}g</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Carbs:</span>
                  <div className="text-gray-900 dark:text-white">{dailyNutrients.carbs}g</div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {meals.map(({ key, label, meal }) => (
                <div key={key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                    {label}
                  </h3>
                  {meal ? (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {meal.name}
                        </h4>
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

                      {meal.ingredients && meal.ingredients.length > 0 && meal.ingredients[0] && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                            Ingredients:
                          </h5>
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

                      {meal.drinks && meal.drinks.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white text-xs mb-1">
                            Drinks:
                          </h5>
                          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {meal.drinks.map((drink, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{drink.name} ({drink.quantity}) - {drink.type}</span>
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 