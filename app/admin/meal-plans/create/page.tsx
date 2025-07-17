"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { MealPlanFormData, DayPlan, Meal, Nutrient } from "../../../../models/mealPlan"

export default function CreateMealPlanPage() {
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MealPlanFormData>()

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
      return
    }
  }, [session, status, router])

  // Initialize with default week structure
  useEffect(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1) // Get Monday of current week
    
    setValue("weekStartDate", monday.toISOString().split('T')[0])
    
    // Create 7 days starting from Monday
    const days: DayPlan[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      days.push({
        date: date.toISOString().split('T')[0],
        meals: {}
      })
    }
    setValue("days", days)
  }, [setValue])

  const onSubmit = async (data: MealPlanFormData) => {
    try {
      setLoading(true)
      setError("")
      
      const res = await fetch("/api/admin/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create meal plan")
      }
      
      router.push("/admin/meal-plans")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    
    const newMeal: Meal = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      ingredients: [""],
      ageRange: "all",
      nutrients: {
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
      },
      mealType,
      prepTime: 0,
      servingSize: "",
      notes: ""
    }
    
    newDays[dayIndex].meals[mealType] = newMeal
    setValue("days", newDays)
  }

  const removeMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    delete newDays[dayIndex].meals[mealType]
    setValue("days", newDays)
  }

  const updateMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', field: string, value: any) => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    if (newDays[dayIndex].meals[mealType]) {
      (newDays[dayIndex].meals[mealType] as any)[field] = value
      setValue("days", newDays)
    }
  }

  const addIngredient = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    if (newDays[dayIndex].meals[mealType]) {
      newDays[dayIndex].meals[mealType]!.ingredients.push("")
      setValue("days", newDays)
    }
  }

  const removeIngredient = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', ingredientIndex: number) => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    if (newDays[dayIndex].meals[mealType]) {
      newDays[dayIndex].meals[mealType]!.ingredients.splice(ingredientIndex, 1)
      setValue("days", newDays)
    }
  }

  const updateIngredient = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner', ingredientIndex: number, value: string) => {
    const currentDays = watch("days") || []
    const newDays = [...currentDays]
    if (newDays[dayIndex].meals[mealType]) {
      newDays[dayIndex].meals[mealType]!.ingredients[ingredientIndex] = value
      setValue("days", newDays)
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

  const days = watch("days") || []
  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'] as const

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create New Meal Plan
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Design a weekly meal plan for children
            </p>
          </div>
          <Link
            href="/admin/meal-plans"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Plans
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Plan Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Plan Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Name *
                </label>
                <input
                  type="text"
                  {...register("name", { required: "Plan name is required" })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Week 1 - Balanced Nutrition"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Week Starting Date *
                </label>
                <input
                  type="date"
                  {...register("weekStartDate", { required: "Start date is required" })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.weekStartDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.weekStartDate.message}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of this meal plan..."
              />
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Weekly Schedule</h2>
            <div className="space-y-6">
              {days.map((day, dayIndex) => (
                <div key={day.date} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  
                  <div className="space-y-4">
                    {mealTypes.map((mealType) => {
                      const meal = day.meals[mealType]
                      return (
                        <div key={mealType} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white capitalize">
                              {mealType}
                            </h4>
                            {meal ? (
                              <button
                                type="button"
                                onClick={() => removeMeal(dayIndex, mealType)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove Meal
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addMeal(dayIndex, mealType)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Add Meal
                              </button>
                            )}
                          </div>
                          
                          {meal && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Meal Name
                                  </label>
                                  <input
                                    type="text"
                                    value={meal.name}
                                    onChange={(e) => updateMeal(dayIndex, mealType, 'name', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Oatmeal with Fruits"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Age Range
                                  </label>
                                  <select
                                    value={meal.ageRange}
                                    onChange={(e) => updateMeal(dayIndex, mealType, 'ageRange', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="all">All Ages</option>
                                    <option value="1-5">1-5 years</option>
                                    <option value="6-12">6-12 years</option>
                                    <option value="13-17">13-17 years</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description
                                </label>
                                <textarea
                                  value={meal.description}
                                  onChange={(e) => updateMeal(dayIndex, mealType, 'description', e.target.value)}
                                  rows={2}
                                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Brief description of the meal..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Ingredients
                                </label>
                                <div className="space-y-2">
                                  {meal.ingredients.map((ingredient, ingredientIndex) => (
                                    <div key={ingredientIndex} className="flex gap-2">
                                      <input
                                        type="text"
                                        value={ingredient}
                                        onChange={(e) => updateIngredient(dayIndex, mealType, ingredientIndex, e.target.value)}
                                        className="flex-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 1 cup rice, 2 eggs"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeIngredient(dayIndex, mealType, ingredientIndex)}
                                        className="text-red-600 hover:text-red-700 px-2"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => addIngredient(dayIndex, mealType)}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    + Add Ingredient
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prep Time (minutes)
                                  </label>
                                  <input
                                    type="number"
                                    value={meal.prepTime || 0}
                                    onChange={(e) => updateMeal(dayIndex, mealType, 'prepTime', parseInt(e.target.value) || 0)}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Serving Size
                                  </label>
                                  <input
                                    type="text"
                                    value={meal.servingSize || ""}
                                    onChange={(e) => updateMeal(dayIndex, mealType, 'servingSize', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 1 cup"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Calories
                                  </label>
                                  <input
                                    type="number"
                                    value={meal.nutrients.calories}
                                    onChange={(e) => updateMeal(dayIndex, mealType, 'nutrients', { ...meal.nutrients, calories: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              href="/admin/meal-plans"
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Meal Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 