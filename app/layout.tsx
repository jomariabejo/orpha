"use client"

import { SessionProvider } from "next-auth/react"
import "./globals.css"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use a client component to access session
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthNavbarWrapper>
            {children}
          </AuthNavbarWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}

function AuthNavbarWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  // Only show navbar if authenticated
  return (
    <>
      {status === 'authenticated' && session && session.user && (
        <nav className="bg-white dark:bg-gray-900 shadow mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                <Link href="/monitoring" className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Monitoring</Link>
                {(session.user as any).role === "admin" && (
                  <Link href="/admin/meal-plans" className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Meal Plans</Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
      {children}
    </>
  );
}
