"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container section">
      <div className="glass max-w-xl rounded-[28px] p-6">
        <h1 className="text-3xl font-black">خطایی رخ داد</h1>
        <p className="mt-3 text-[#6F6256]">لطفا دوباره تلاش کنید.</p>
        <button className="btn-primary btn mt-6" onClick={reset}>تلاش دوباره</button>
      </div>
    </section>
  );
}

