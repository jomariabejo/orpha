"use client"

import { useForm } from "react-hook-form"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { register, handleSubmit } = useForm<{ email: string; password: string }>()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.replace("/monitoring")
    }
  }, [session, router])

  async function onSubmit(data: { email: string; password: string }) {
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password.")
    } else {
      router.replace("/monitoring")
    }
  }

  if (session) {
    return <div className="p-6 text-gray-700 dark:text-gray-200">Redirecting...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Staff Sign In</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input type="email" {...register("email", { required: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <input type="password" {...register("password", { required: true })} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <div className="text-red-500 dark:text-red-400 font-medium">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-2 rounded-lg font-semibold shadow disabled:opacity-60">{loading ? "Signing in..." : "Sign In"}</button>
        </form>
        <div className="mt-6 text-center">
          <a href="/monitoring" className="text-blue-600 dark:text-blue-400 underline">Back to Monitoring</a>
        </div>
      </div>
    </div>
  )
} 