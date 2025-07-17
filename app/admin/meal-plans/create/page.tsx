"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { DailyMealPlanFormData, Meal, Drink } from "../../../../models/mealPlan"

export default function CreateDailyMealPlanPage() {
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DailyMealPlanFormData>()

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
      return
    }
  }, [session, status, router])

  // Initialize with today's date
  useEffect(() => {
    const today = new Date()
    setValue("date", today.toISOString().split('T')[0])
  }, [setValue])

  const onSubmit = async (data: DailyMealPlanFormData) => {
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

  const createNewMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack'): Meal => ({
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
    mealType: mealType === 'morningSnack' || mealType === 'afternoonSnack' ? 'snack' : mealType,
    prepTime: 0,
    servingSize: "",
    notes: "",
    drinks: []
  })

  const addMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack') => {
    const newMeal = createNewMeal(mealType)
    setValue(mealType, newMeal)
  }

  const removeMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack') => {
    setValue(mealType, undefined)
  }

  const updateMeal = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack', field: string, value: any) => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedMeal = { ...currentMeal, [field]: value }
      setValue(mealType, updatedMeal)
    }
  }

  const addIngredient = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack') => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedMeal = { ...currentMeal, ingredients: [...currentMeal.ingredients, ""] }
      setValue(mealType, updatedMeal)
    }
  }

  const removeIngredient = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack', ingredientIndex: number) => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedIngredients = currentMeal.ingredients.filter((_, index) => index !== ingredientIndex)
      const updatedMeal = { ...currentMeal, ingredients: updatedIngredients }
      setValue(mealType, updatedMeal)
    }
  }

  const updateIngredient = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack', ingredientIndex: number, value: string) => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedIngredients = [...currentMeal.ingredients]
      updatedIngredients[ingredientIndex] = value
      const updatedMeal = { ...currentMeal, ingredients: updatedIngredients }
      setValue(mealType, updatedMeal)
    }
  }

  const addDrink = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack') => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const newDrink: Drink = {
        name: "",
        quantity: "",
        type: "water"
      }
      const updatedMeal = { ...currentMeal, drinks: [...currentMeal.drinks, newDrink] }
      setValue(mealType, updatedMeal)
    }
  }

  const removeDrink = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack', drinkIndex: number) => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedDrinks = currentMeal.drinks.filter((_, index) => index !== drinkIndex)
      const updatedMeal = { ...currentMeal, drinks: updatedDrinks }
      setValue(mealType, updatedMeal)
    }
  }

  const updateDrink = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'morningSnack' | 'afternoonSnack', drinkIndex: number, field: keyof Drink, value: string) => {
    const currentMeal = watch(mealType)
    if (currentMeal) {
      const updatedDrinks = [...currentMeal.drinks]
      updatedDrinks[drinkIndex] = { ...updatedDrinks[drinkIndex], [field]: value }
      const updatedMeal = { ...currentMeal, drinks: updatedDrinks }
      setValue(mealType, updatedMeal)
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

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'morningSnack', label: 'Morning Snack' },
    { key: 'afternoonSnack', label: 'Afternoon Snack' }
  ] as const

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create Daily Meal Plan
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Design a meal plan for a single day
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
          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Date</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Meals */}
          {mealTypes.map(({ key, label }) => {
            const meal = watch(key)
            return (
              <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{label}</h2>
                  {meal ? (
                    <button
                      type="button"
                      onClick={() => removeMeal(key)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove Meal
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addMeal(key)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add Meal
                    </button>
                  )}
                </div>
                
                {meal && (
                  <div className="space-y-6">
                    {/* Basic Meal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Meal Name
                        </label>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMeal(key, 'name', e.target.value)}
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
                          onChange={(e) => updateMeal(key, 'ageRange', e.target.value)}
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
                        onChange={(e) => updateMeal(key, 'description', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief description of the meal..."
                      />
                    </div>
                    
                    {/* Ingredients */}
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
                              onChange={(e) => updateIngredient(key, ingredientIndex, e.target.value)}
                              className="flex-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 1 cup rice, 2 eggs"
                            />
                            <button
                              type="button"
                              onClick={() => removeIngredient(key, ingredientIndex)}
                              className="text-red-600 hover:text-red-700 px-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addIngredient(key)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add Ingredient
                        </button>
                      </div>
                    </div>

                    {/* Drinks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Drinks
                      </label>
                      <div className="space-y-2">
                        {meal.drinks.map((drink, drinkIndex) => (
                          <div key={drinkIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={drink.name}
                              onChange={(e) => updateDrink(key, drinkIndex, 'name', e.target.value)}
                              className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., Water, Milk"
                            />
                            <input
                              type="text"
                              value={drink.quantity}
                              onChange={(e) => updateDrink(key, drinkIndex, 'quantity', e.target.value)}
                              className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g., 1 glass, 250ml"
                            />
                            <div className="flex gap-2">
                              <select
                                value={drink.type}
                                onChange={(e) => updateDrink(key, drinkIndex, 'type', e.target.value)}
                                className="flex-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="water">Water</option>
                                <option value="milk">Milk</option>
                                <option value="juice">Juice</option>
                                <option value="smoothie">Smoothie</option>
                                <option value="tea">Tea</option>
                                <option value="other">Other</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeDrink(key, drinkIndex)}
                                className="text-red-600 hover:text-red-700 px-2"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addDrink(key)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          + Add Drink
                        </button>
                      </div>
                    </div>
                    
                    {/* Nutrition and Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Prep Time (minutes)
                        </label>
                        <input
                          type="number"
                          value={meal.prepTime || 0}
                          onChange={(e) => updateMeal(key, 'prepTime', parseInt(e.target.value) || 0)}
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
                          onChange={(e) => updateMeal(key, 'servingSize', e.target.value)}
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
                          onChange={(e) => updateMeal(key, 'nutrients', { ...meal.nutrients, calories: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={meal.notes || ""}
                        onChange={(e) => updateMeal(key, 'notes', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Submit Buttons */}
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