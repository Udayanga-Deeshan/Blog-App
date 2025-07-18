'use client';
import { useState, ChangeEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "@/lib/Superbase";
import { v4 as uuidv4 } from "uuid";
import { ArrowUpTrayIcon, XMarkIcon, ArrowPathIcon, SparklesIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPremium: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setError("");

    if (file) {
      // Validate image size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreatePost = async () => {
    if (!formData.title || !formData.description) {
      setError("Please fill all required fields");
      return;
    }

    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Upload image to Supabase Storage
      const imageName = `${uuidv4()}-${imageFile.name}`;
      const { error: storageError } = await supabase.storage
        .from("post-images")
        .upload(imageName, imageFile);

      if (storageError) throw storageError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("post-images")
        .getPublicUrl(imageName);

      // Insert post into database
      const { error: dbError } = await supabase.from("posts").insert({
        title: formData.title,
        description: formData.description,
        image_url: publicUrl,
        is_premium: formData.isPremium,
        created_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <SparklesIcon className="h-6 w-6" />
              Create New Post
            </h1>
          </div>

          {/* Form */}
          <div className="px-6 py-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Post Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter a catchy title..."
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your post content here..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image *
              </label>
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
                  onClick={() => fileInputRef.current?.click()}>
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Post Visibility</h3>
                <p className="text-xs text-gray-500">
                  {formData.isPremium ? "Premium posts are only visible to subscribers" : "Public posts are visible to everyone"}
                </p>
              </div>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPremium: false }))}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${!formData.isPremium ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  <div className="flex items-center gap-1">
                    <GlobeAltIcon className="h-4 w-4" />
                    Public
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPremium: true }))}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${formData.isPremium ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  <div className="flex items-center gap-1">
                    <SparklesIcon className="h-4 w-4" />
                    Premium
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleCreatePost}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    Publishing...
                  </>
                ) : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}