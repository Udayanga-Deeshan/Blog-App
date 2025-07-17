'use client'
import { useState } from 'react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Just for UI demo – remove error after styling test
    setError('This is a dummy signup UI')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1e293b] flex items-center justify-center">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Create Your Account</h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-300 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 underline">Log In</a>
        </p>
      </div>
    </div>
  )
}
