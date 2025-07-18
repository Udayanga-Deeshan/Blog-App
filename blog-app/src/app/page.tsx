'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/Superbase'
import { LockClosedIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredPost, setFeaturedPost] = useState<any>(null)
  const [isPremiumUser, setIsPremiumUser] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsPremiumUser(user?.user_metadata?.is_premium || false)

        let query = supabase
          .from('posts')
          .select('*')
          .or(`is_premium.eq.false${isPremiumUser ? ',is_premium.eq.true' : ''}`)
          .order('created_at', { ascending: false })

        const { data, error } = await query

        if (error) throw error

        setPosts(data || [])
        setFeaturedPost(data?.find(post => post.is_featured) || data?.[0])
      } catch (err) {
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isPremiumUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      {featuredPost && (
        <div className="relative bg-gray-900 text-white">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src={featuredPost.image_url} 
            alt={featuredPost.title}
            className="w-full h-96 object-cover"
          />
          <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-2xl">
              {featuredPost.is_premium && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-gray-900 mb-4">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Premium Content
                </span>
              )}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                {featuredPost.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6 line-clamp-2">
                {featuredPost.description}
              </p>
              <Link
                href={`/posts/${featuredPost.id}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Read Story
              </Link>
            </div>
          </div>
        </div>
      )}

      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Stories</h2>
          
          {/* Posts Grid*/}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="bg-white/50 backdrop-blur-sm border border-gray-200/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {post.is_premium && !isPremiumUser && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full flex items-center">
                        <LockClosedIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Premium</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    {post.is_premium && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Premium
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Link
                      href={`/posts/${post.id}`}
                      className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors w-full text-center"
                    >
                      Read Post
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium  */}
        {!isPremiumUser && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Unlock Premium Content
                </h2>
                <p className="mt-4 text-lg text-blue-100">
                  Get access to exclusive articles, in-depth guides, and ad-free reading.
                </p>
                <div className="mt-8">
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-gray-50"
                  >
                    Upgrade Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


