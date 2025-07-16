"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function ChildProfilePage() {
  const { childId } = useParams() as { childId: string }
  const router = useRouter()
  const [child, setChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formError, setFormError] = useState("")

  // Forms
  const weightForm = useForm<{ weight: number; date: string }>()
  const heightForm = useForm<{ height: number; date: string }>()
  const mealForm = useForm<{ mealNote: string; date: string }>()
  const healthForm = useForm<{ healthRemark: string; date: string }>()

  async function fetchChild() {
    setLoading(true)
    const res = await fetch(`/api/monitoring/${childId}`)
    if (res.ok) {
      setChild(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (childId) fetchChild()
    // eslint-disable-next-line
  }, [childId])

  async function handlePatch(data: any) {
    setFormError("")
    const res = await fetch(`/api/monitoring/${childId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      setFormError(err.error || "Failed to update child")
      return
    }
    await fetchChild()
  }

  // Prepare chart data
  const weightLabels = child?.weightHistory?.map((w: any) => w.date) || []
  const weightData = child?.weightHistory?.map((w: any) => w.weight) || []
  const heightLabels = child?.heightHistory?.map((h: any) => h.date) || []
  const heightData = child?.heightHistory?.map((h: any) => h.height) || []

  // Calculate latest BMI
  const latestWeight = child?.weightHistory?.length ? child.weightHistory[child.weightHistory.length - 1].weight : null;
  const latestHeightCm = child?.heightHistory?.length ? child.heightHistory[child.heightHistory.length - 1].height : null;
  const latestHeightM = latestHeightCm ? latestHeightCm / 100 : null;
  const latestBMI = latestWeight && latestHeightM ? (latestWeight / (latestHeightM * latestHeightM)) : null;
  function bmiStatus(bmi: number) {
    if (bmi < 14) return 'Severely Underweight';
    if (bmi < 16) return 'Underweight';
    if (bmi < 18.5) return 'Mildly Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
  // Prepare BMI chart data
  const bmiHistory = (child?.weightHistory || []).map((w: any, i: number) => {
    const h = child.heightHistory?.[i]?.height;
    if (!h) return null;
    return {
      date: w.date,
      bmi: w.weight / ((h / 100) * (h / 100))
    };
  }).filter(Boolean);
  const bmiLabels = bmiHistory.map((b: any) => b.date);
  const bmiData = bmiHistory.map((b: any) => b.bmi);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#1e293b' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#e5e7eb' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#e5e7eb' } },
    },
  }
  const darkChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { labels: { color: '#f1f5f9' } },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } },
    },
  }

  // Detect dark mode
  const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  if (loading) return <div className="p-6 text-gray-700 dark:text-gray-200">Loading...</div>
  if (!child) return <div className="p-6 text-red-600 dark:text-red-400">Child not found.</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-2xl mx-auto p-6">
        <button className="mb-4 text-blue-600 dark:text-blue-400 underline font-medium" onClick={() => router.push('/monitoring')}>&larr; Back to list</button>
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6 mb-4">
            {child.photoUrl ? (
              <img src={child.photoUrl} alt={child.name} className="w-20 h-20 rounded-full object-cover border-2 border-blue-400" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-400 font-bold border-2 border-blue-400">
                {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '👤'}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-extrabold mb-1 text-gray-900 dark:text-white tracking-tight">{child.name}</h1>
              <div className="mb-1 text-lg text-gray-700 dark:text-gray-200">Age: <span className="font-semibold">{child.age}</span> | Gender: <span className="font-semibold capitalize">{child.gender}</span></div>
              <div className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Admitted: {child.admissionDate}</div>
              {child.caregiver && <div className="mb-1 text-gray-500 dark:text-gray-400 text-sm">Caregiver: {child.caregiver}</div>}
            </div>
          </div>
          {/* BMI Checker */}
          <div className="mb-6">
            <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">BMI Checker</div>
            {latestBMI ? (
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold" style={{ color: latestBMI < 14 ? '#ef4444' : latestBMI < 16 ? '#f59e42' : latestBMI < 18.5 ? '#fbbf24' : latestBMI < 25 ? '#22c55e' : latestBMI < 30 ? '#f59e42' : '#ef4444' }}>{latestBMI.toFixed(1)}</span>
                <span className="text-md font-medium px-3 py-1 rounded-full" style={{ background: latestBMI < 14 ? '#fee2e2' : latestBMI < 16 ? '#fef3c7' : latestBMI < 18.5 ? '#fef9c3' : latestBMI < 25 ? '#dcfce7' : latestBMI < 30 ? '#fef3c7' : '#fee2e2', color: latestBMI < 25 ? '#166534' : '#b91c1c' }}>{bmiStatus(latestBMI)}</span>
              </div>
            ) : (
              <div className="italic text-gray-400">Add weight and height data to calculate BMI.</div>
            )}
            {bmiData.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">BMI History</h3>
                <Line
                  data={{
                    labels: bmiLabels,
                    datasets: [
                      {
                        label: 'BMI',
                        data: bmiData,
                        borderColor: '#a21caf',
                        backgroundColor: isDark ? '#f472b6' : '#a21caf',
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={isDark ? darkChartOptions : chartOptions}
                  height={180}
                />
              </div>
            )}
          </div>

          {/* Entry Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Weight */}
            <form
              onSubmit={weightForm.handleSubmit(async (data) => {
                await handlePatch({ weight: data.weight, date: data.date })
                weightForm.reset()
              })}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Add Weight</div>
              <input type="number" step="0.01" placeholder="Weight (kg)" {...weightForm.register("weight", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <input type="date" {...weightForm.register("date", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded font-semibold">Add</button>
            </form>
            {/* Height */}
            <form
              onSubmit={heightForm.handleSubmit(async (data) => {
                await handlePatch({ height: data.height, date: data.date })
                heightForm.reset()
              })}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Add Height</div>
              <input type="number" step="0.1" placeholder="Height (cm)" {...heightForm.register("height", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <input type="date" {...heightForm.register("date", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded font-semibold">Add</button>
            </form>
            {/* Meal Note */}
            <form
              onSubmit={mealForm.handleSubmit(async (data) => {
                await handlePatch({ mealNote: data.mealNote, date: data.date })
                mealForm.reset()
              })}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Add Meal Note</div>
              <input type="text" placeholder="Meal note" {...mealForm.register("mealNote", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <input type="date" {...mealForm.register("date", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded font-semibold">Add</button>
            </form>
            {/* Health Remark */}
            <form
              onSubmit={healthForm.handleSubmit(async (data) => {
                await handlePatch({ healthRemark: data.healthRemark, date: data.date })
                healthForm.reset()
              })}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Add Health Remark</div>
              <input type="text" placeholder="Health remark" {...healthForm.register("healthRemark", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <input type="date" {...healthForm.register("date", { required: true })} className="mb-2 w-full p-2 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-1.5 rounded font-semibold">Add</button>
            </form>
          </div>
          {formError && <div className="text-red-500 dark:text-red-400 font-medium mb-4">{formError}</div>}

          {/* Weight Chart */}
          <div className="mt-6 mb-8">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Weight Trend</h2>
            {weightData.length > 0 ? (
              <Line
                data={{
                  labels: weightLabels,
                  datasets: [
                    {
                      label: 'Weight (kg)',
                      data: weightData,
                      borderColor: '#2563eb',
                      backgroundColor: isDark ? '#60a5fa' : '#2563eb',
                      tension: 0.3,
                    },
                  ],
                }}
                options={isDark ? darkChartOptions : chartOptions}
                height={220}
              />
            ) : (
              <div className="italic text-gray-400">No weight data to display.</div>
            )}
          </div>

          {/* Height Chart */}
          <div className="mb-8">
            <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Height Trend</h2>
            {heightData.length > 0 ? (
              <Line
                data={{
                  labels: heightLabels,
                  datasets: [
                    {
                      label: 'Height (cm)',
                      data: heightData,
                      borderColor: '#059669',
                      backgroundColor: isDark ? '#6ee7b7' : '#059669',
                      tension: 0.3,
                    },
                  ],
                }}
                options={isDark ? darkChartOptions : chartOptions}
                height={220}
              />
            ) : (
              <div className="italic text-gray-400">No height data to display.</div>
            )}
          </div>

          {/* Log History Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Weight History</h2>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {child.weightHistory?.length ? child.weightHistory.map((w: any, i: number) => (
                  <li key={i}>{w.date}: <span className="font-semibold">{w.weight} kg</span></li>
                )) : <li className="italic text-gray-400">No entries</li>}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Height History</h2>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {child.heightHistory?.length ? child.heightHistory.map((h: any, i: number) => (
                  <li key={i}>{h.date}: <span className="font-semibold">{h.height} cm</span></li>
                )) : <li className="italic text-gray-400">No entries</li>}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Meal Notes</h2>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {child.mealNotes?.length ? child.mealNotes.map((m: any, i: number) => (
                  <li key={i}>{m.date}: <span className="font-medium">{m.note}</span></li>
                )) : <li className="italic text-gray-400">No entries</li>}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Health Remarks</h2>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {child.healthRemarks?.length ? child.healthRemarks.map((h: any, i: number) => (
                  <li key={i}>{h.date}: <span className="font-medium">{h.note}</span></li>
                )) : <li className="italic text-gray-400">No entries</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 