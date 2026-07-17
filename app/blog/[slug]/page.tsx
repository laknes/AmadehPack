import { notFound } from "next/navigation";
import { posts } from "@/lib/data";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();
  return (
    <article className="container section max-w-3xl">
      <p className="text-[#B8874B]">مجله آماده‌پک</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">{post.title}</h1>
      <p className="mt-6 leading-9 text-[#6F6256]">{post.excerpt}</p>
      <div className="glass mt-8 rounded-[28px] p-6 leading-9 text-[#6F6256]">این مقاله نمونه از سیستم بلاگ است و از پنل مدیریت قابل ایجاد، ویرایش، انتشار و مدیریت تصویر کاور خواهد بود.</div>
    </article>
  );
}
