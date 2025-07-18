// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from "@/lib/Superbase";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setError('');
//   setSuccess('');
//   setLoading(true);

//   const { data, error: signUpError } = await supabase.auth.signUp({
//     email,
//     password,
//   });

//   if (signUpError) {
//     setLoading(false);
//     setError(signUpError.message);
//     return;
//   }

//   // After successful sign-up
//   const user = data.user;

//   if (user) {
//     const { error: insertError } = await supabase.from('profiles').insert([
//       {
//         id: user.id,     // auth.uid()
//         email: user.email,
//       },
//     ]);

//     if (insertError) {
//       setLoading(false);
//       setError(`Registered but profile insert failed: ${insertError.message}`);
//       return;
//     }
//   }

//   setLoading(false);
//   setSuccess('Please check your email to confirm your registration.');
//   setTimeout(() => router.push('/login'), 4000);
// };


//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white p-6 rounded shadow w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

//         {error && <p className="text-red-600 mb-2">{error}</p>}
//         {success && <p className="text-green-600 mb-2">{success}</p>}

//         <form onSubmit={handleRegister} className="space-y-4">
//           <div>
//             <label className="block mb-1">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-2 border rounded"
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-2 border rounded"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded"
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/Superbase";
import { EnvelopeIcon, LockClosedIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      // Register user with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        throw signUpError;
      }

      // After successful sign-up
      const user = data.user;

      if (user) {
        // Create minimal profile in profiles table
        const { error: insertError } = await supabase.from('profiles').insert([
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
        ]);

        if (insertError) {
          throw new Error(`Registered but profile creation failed: ${insertError.message}`);
        }
      }

      setSuccess('Registration successful! Please check your email to confirm your account.');
      setTimeout(() => router.push('/login'), 4000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h1 className="text-2xl font-bold text-center">Create Account</h1>
          <p className="text-blue-100 text-center text-sm mt-1">
            Sign up to access our platform
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
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-start gap-2">
              <CheckCircleIcon className="h-5 w-5 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
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
                  Registering...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}