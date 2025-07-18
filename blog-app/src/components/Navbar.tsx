'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/Superbase'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-white" />
          <span className="text-xl font-bold tracking-wide">
            BlogWave
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-5 text-sm font-medium">
          <Link
            href="/"
            className={`hover:text-blue-200 transition-colors ${pathname === '/' ? 'text-white font-semibold' : 'text-blue-100'}`}
          >
            Home
          </Link>
          
          {/* Only show Dashboard link if user is logged in */}
          {user && (
            <Link
              href="/dashboard"
              className={`hover:text-blue-200 transition-colors ${pathname === '/dashboard' ? 'text-white font-semibold' : 'text-blue-100'}`}
            >
              Dashboard
            </Link>
          )}
          
          <Link
            href="/premium"
            className={`hover:text-blue-200 transition-colors ${pathname === '/premium' ? 'text-white font-semibold' : 'text-blue-100'}`}
          >
            Premium
          </Link>

          {loading ? (
            <div className="h-8 w-20 bg-blue-500/20 rounded animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-blue-100 text-sm hidden md:inline">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`hover:text-blue-200 transition-colors ${pathname === '/login' ? 'text-white font-semibold' : 'text-blue-100'}`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}