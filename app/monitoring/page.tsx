"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

type ChildForm = {
  name: string
  age: number
  gender: 'male' | 'female'
  admissionDate: string
  photoUrl?: string
  caregiver?: string
}

type Child = {
  id: string
  name: string
  age: number
  gender: 'male' | 'female'
  admissionDate: string
  photoUrl?: string
  caregiver?: string
}

export default function MonitoringPage() {
  const { data: session, status } = useSession() as {
    data: any;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, reset } = useForm<ChildForm>()
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session || !session.user || (session.user as any).role !== "admin") {
      router.replace("/auth/signin")
    }
  }, [session, status, router])

  async function fetchChildren() {
    setLoading(true)
    const res = await fetch("/api/monitoring")
    const data = await res.json()
    setChildren(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  async function onSubmit(data: ChildForm) {
    setError("")
    const res = await fetch("/api/monitoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      setError(err.error || "Failed to add child")
      return
    }
    reset()
    fetchChildren()
  }

  useEffect(() => {
    if (session) {
      router.replace("/monitoring");
    }
  }, [session, router]);

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
      <div className="max-w-2xl mx-auto p-6">
        {/* Auth UI */}
        <div className="flex justify-end mb-4">
          {session && session.user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                {session.user.name} <span className="text-xs text-blue-600 dark:text-blue-400">({(session.user as any).role})</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold shadow"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-semibold shadow"
            >
              Login
            </button>
          )}
        </div>
        <h1 className="text-3xl font-extrabold mb-4 text-gray-900 dark:text-white tracking-tight">Monitoring System</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-8 space-y-4 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Name</label>
            <input {...register("name", { required: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Age</label>
            <input type="number" {...register("age", { required: true, valueAsNumber: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Gender</label>
            <select {...register("gender", { required: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Admission Date</label>
            <input type="date" {...register("admissionDate", { required: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Photo URL (optional)</label>
            <input type="url" {...register("photoUrl")} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Caregiver (optional)</label>
            <input {...register("caregiver")} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full" />
          </div>
          {error && <div className="text-red-500 dark:text-red-400 font-medium">{error}</div>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded-lg font-semibold shadow">Add Child</button>
        </form>
        <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Children List</h2>
        {loading ? (
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        ) : (
          <ul className="space-y-3">
            {children.map(child => (
              <li key={child.id}>
                <Link href={`/monitoring/${child.id}`} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:bg-blue-50 dark:hover:bg-blue-950 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {child.photoUrl ? (
                    <img src={child.photoUrl} alt={child.name} className="w-14 h-14 rounded-full object-cover border border-gray-300 dark:border-gray-600" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl text-gray-400 font-bold border border-gray-300 dark:border-gray-600">
                      {child.gender === 'male' ? '👦' : child.gender === 'female' ? '👧' : '👤'}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-900 dark:text-white font-medium text-lg">{child.name}</span>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Age: {child.age} | Gender: {child.gender ? (child.gender.charAt(0).toUpperCase() + child.gender.slice(1)) : "Unknown"}</div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs">Admitted: {child.admissionDate}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 