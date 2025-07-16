import Link from "next/link";

export default function Home() {
  
 const samplePosts = [
  {
    id: 1,
    title: "Welcome to My Blog",
    slug: "welcome-to-my-blog",
    excerpt: "This is a short intro to my blog...",
    content: "Full content for the welcome blog post.",
    published_at: "2025-07-16",
  },
  {
    id: 2,
    title: "Getting Started with Next.js",
    slug: "getting-started-with-nextjs",
    excerpt: "Here's how to get started with Next.js in minutes.",
    content: "This post explains how to set up and run a Next.js app.",
    published_at: "2025-07-15",
  },
];

  return (
     <main className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
           Blog Posts
        </h1>

        <div className="space-y-6">
          {samplePosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {post.title}
              </h2>
              <p className="text-gray-600 mb-2">{post.excerpt}</p>
              <p className="text-sm text-gray-400 mb-4">
                Published on {post.published_at}
              </p>
              <Link
                href={`/posts/${post.slug}`}
                className="inline-block text-white bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md text-sm"
              >
                Read More →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
