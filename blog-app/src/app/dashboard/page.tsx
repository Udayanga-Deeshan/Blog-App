'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/Superbase'
import { PencilIcon, TrashIcon, ArrowPathIcon, LockClosedIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [filteredPosts, setFilteredPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'premium'>('all')
  const [editingPost, setEditingPost] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    is_premium: false
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch posts and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUser(user)

        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setPosts(data || [])
        setFilteredPosts(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Filter posts based on search and visibility
  useEffect(() => {
    let results = posts
    
    if (searchQuery) {
      results = results.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (visibilityFilter !== 'all') {
      results = results.filter(post => 
        visibilityFilter === 'public' ? !post.is_premium : post.is_premium
      )
    }
    
    setFilteredPosts(results)
  }, [searchQuery, visibilityFilter, posts])

  // Delete a post
  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== postId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Toggle post visibility
  const toggleVisibility = async (postId: string, isPremium: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_premium: !isPremium })
        .eq('id', postId)

      if (error) throw error
      
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, is_premium: !isPremium } : post
      ))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Open edit modal with post data
  const openEditModal = (post: any) => {
    setEditingPost(post)
    setEditFormData({
      title: post.title,
      description: post.description,
      is_premium: post.is_premium
    })
    setImagePreview(post.image_url)
  }

  // Handle edit form changes
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle image change for edit
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit edited post
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = editingPost.image_url
      
      // Upload new image if changed
      if (imageFile) {
        const imageName = `${Date.now()}-${imageFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(imageName, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(imageName)
        
        imageUrl = publicUrl
      }

      // Update post in database
      const { error } = await supabase
        .from('posts')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          is_premium: editFormData.is_premium,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPost.id)

      if (error) throw error

      // Update local state
      setPosts(posts.map(post => 
        post.id === editingPost.id ? { 
          ...post, 
          ...editFormData,
          image_url: imageUrl
        } : post
      ))

      setEditingPost(null)
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-6">
      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">Edit Post</h2>
              <button 
                onClick={() => setEditingPost(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                {imagePreview && (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mb-2 max-h-40 object-cover rounded-md"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_premium"
                  name="is_premium"
                  checked={editFormData.is_premium}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    is_premium: e.target.checked
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_premium" className="ml-2 block text-sm text-gray-700">
                  Premium Content
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rest of your dashboard UI remains the same */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'} • Last updated just now
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search posts..."
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="public">Public</option>
                <option value="premium">Premium</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <Link
              href="/create-post"
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
            >
              + New
            </Link>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start gap-2">
            <svg className="h-4 w-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Posts list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchQuery || visibilityFilter !== 'all' ? 'No matching posts' : 'No posts yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || visibilityFilter !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Get started by creating your first post'}
              </p>
              <Link
                href="/create-post"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Create Post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPosts.map(post => (
                <div key={post.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {post.image_url && (
                      <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={post.image_url} 
                          alt={post.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {post.is_premium && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {post.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleVisibility(post.id, post.is_premium)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            title={post.is_premium ? 'Make Public' : 'Make Premium'}
                          >
                            {post.is_premium ? (
                              <LockClosedIcon className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(post)}
                            className="text-gray-400 hover:text-blue-600 p-1 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium CTA */}
        {(!user?.user_metadata?.is_premium && posts.some(p => p.is_premium)) && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Unlock Premium Content</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Upgrade to access exclusive posts and features
                </p>
              </div>
              <Link
                href="/upgrade"
                className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
              >
                Upgrade Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}