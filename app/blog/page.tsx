import Link from "next/link";
import { posts } from "@/lib/data";

export const metadata = { title: "مجله" };

export default function BlogPage() {
  return (
    <section className="container section">
      <h1 className="mb-8 text-4xl font-black">مجله آماده‌پک</h1>
      <div className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="glass rounded-[28px] p-6 transition hover:-translate-y-1">
            <p className="text-[#B8874B]">راهنما</p>
            <h2 className="mt-4 text-xl font-bold leading-8">{post.title}</h2>
            <p className="mt-4 leading-8 text-[#6F6256]">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

