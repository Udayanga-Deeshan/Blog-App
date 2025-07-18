// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')

//   const dummyUser = {
//     email: 'demo@blog.com',
//     password: 'password123',
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')

//     if (email === dummyUser.email && password === dummyUser.password) {
//       router.push('/dashboard')
//     } else {
//       setError('Invalid email or password')
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1e293b] flex items-center justify-center">
//       <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
//         <h1 className="text-3xl font-bold text-white text-center mb-6">Welcome Back</h1>
        
//         {error && <p className="text-red-400 text-center mb-4">{error}</p>}

//         <form onSubmit={handleLogin} className="space-y-5">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={e => setEmail(e.target.value)}
//             required
//             className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             required
//             className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />
//           <button
//             type="submit"
//             className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition duration-300"
//           >
//             Log In
//           </button>
//         </form>

//         <p className="mt-6 text-sm text-gray-300 text-center">
//           Don&apos;t have an account?{' '}
//           <Link href="/signup" className="text-emerald-400 hover:underline">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   )
// }


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/Superbase";
import { EnvelopeIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <p className="text-blue-100 text-center text-sm mt-1">
            Sign in to access your account
          </p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}