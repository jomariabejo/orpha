"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [apiResult, setApiResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testApi = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/meal-plans')
      const data = await response.json()
      setApiResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  if (status === "loading") {
    return <div className="p-6">Loading...</div>
  }

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test Authentication</h1>
        <p className="mb-4">You are not signed in.</p>
        <button
          onClick={() => signIn("credentials", { 
            email: "admin@example.com", 
            password: "admin123",
            redirect: false 
          })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign in as Admin
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Authentication</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Session Info:</h2>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold">User Role:</h2>
        <p>{(session.user as any)?.role || 'No role found'}</p>
      </div>

      <div className="mb-4">
        <button
          onClick={testApi}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Endpoint'}
        </button>
      </div>

      {apiResult && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">API Result:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {apiResult}
          </pre>
        </div>
      )}

      <button
        onClick={() => signOut()}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  )
} 