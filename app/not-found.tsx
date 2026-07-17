import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="container section">
      <div className="glass max-w-xl rounded-[28px] p-6">
        <h1 className="text-3xl font-black">صفحه پیدا نشد</h1>
        <Link className="btn-primary btn mt-6" href="/">بازگشت به خانه</Link>
      </div>
    </section>
  );
}

