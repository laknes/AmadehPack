import { GlassPanel } from "@/components/glass-panel";

export const metadata = { title: "درباره ما" };

export default function AboutPage() {
  return (
    <section className="container section">
      <div className="max-w-3xl">
        <p className="text-[#B8874B]">درباره آماده‌پک</p>
        <h1 className="mt-2 text-4xl font-black">زیرساخت تامین بسته‌بندی برای برندهای غذایی</h1>
        <p className="mt-6 leading-9 text-[#6F6256]">آماده‌پک با تمرکز بر ظروف کاغذی، کرافت، کارتن پیتزا و ملزومات سرو غذا، تجربه خریدی سریع و شفاف برای سفارش‌های خرده و عمده فراهم می‌کند.</p>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {["کیفیت ثابت", "قابلیت چاپ اختصاصی", "پشتیبانی فروش عمده"].map((item) => <GlassPanel key={item}><h2 className="text-xl font-bold">{item}</h2><p className="mt-3 text-[#6F6256]">فرآیند انتخاب، سفارش و پیگیری با استانداردهای قابل اتکا طراحی شده است.</p></GlassPanel>)}
      </div>
    </section>
  );
}

