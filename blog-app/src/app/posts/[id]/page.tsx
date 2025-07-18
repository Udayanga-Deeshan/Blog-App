'use client'
import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { supabase } from '@/lib/Superbase'
import { LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { use } from 'react'

async function getPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

async function getUserStatus() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.user_metadata?.is_premium || false
  } catch (error) {
    console.error('Error getting user status:', error)
    return false
  }
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const premiumStatus = await getUserStatus()
        setIsPremiumUser(premiumStatus)

        const postData = await getPost(id)

        if (!postData) {
          setError('Post not found')
          return
        }

        if (postData.is_premium && !premiumStatus) {
          setError('This is premium content. Please upgrade your account to view it.')
          return
        }

        setPost(postData)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    if (error === 'Post not found') {
      return notFound()
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center">
          <LockClosedIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Content</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/upgrade"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Upgrade Account
          </Link>
        </div>
      </div>
    )
  }

  if (!post) return notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Post Header */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img 
          src={post.image_url} 
          alt={post.title}
          className="w-full h-96 object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            {post.is_premium && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400 text-gray-900 mb-4">
                Premium Content
              </span>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {post.title}
            </h1>
            {/* Added description display */}
            {post.description && (
              <p className="text-xl text-gray-300 mb-6">
                {post.description}
              </p>
            )}
            <div className="flex items-center text-gray-300">
              <span className="text-sm">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    </div>
  )
}