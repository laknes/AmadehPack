import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck, Sparkles, Truck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#B8874B]/25 bg-[#FFF4DF]">
      <div className="container grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <section className="glass rounded-[28px] p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#FF8A1F] text-[#1c1108] font-black">AP</span>
            <div>
              <strong className="text-xl">آماده‌پک</strong>
              <p className="text-sm text-[#6F6256]">فروشگاه هوشمند بسته‌بندی غذا</p>
            </div>
          </div>
          <p className="leading-8 text-[#6F6256]">تامین تخصصی ظروف کاغذی، کرافت و ملزومات بسته‌بندی برای کافه‌ها، رستوران‌ها و برندهای غذایی با تجربه خرید سریع، شفاف و حرفه‌ای.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[["ارسال عمده", Truck], ["پرداخت امن", ShieldCheck], ["چاپ اختصاصی", Sparkles]].map(([label, Icon]) => (
              <div key={String(label)} className="rounded-2xl border border-[#B8874B]/25 bg-white p-3 text-sm text-[#4A2F1B]">
                <Icon className="mb-2 text-[#FF8A1F]" size={20} />
                {label as string}
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-4 font-bold">فروشگاه</h3>
          <div className="grid gap-3 text-[#6F6256]">
            <Link href="/shop">همه محصولات</Link>
            <Link href="/cart">سبد خرید</Link>
            <Link href="/checkout">تسویه حساب</Link>
            <Link href="/orders">پیگیری سفارش</Link>
          </div>
        </section>
        <section>
          <h3 className="mb-4 font-bold">شرکت</h3>
          <div className="grid gap-3 text-[#6F6256]">
            <Link href="/about">درباره ما</Link>
            <Link href="/contact">تماس با ما</Link>
            <Link href="/blog">مجله</Link>
            <Link href="/privacy">قوانین و حریم خصوصی</Link>
          </div>
        </section>
        <section>
          <h3 className="mb-4 font-bold">ارتباط</h3>
          <div className="grid gap-3 text-[#6F6256]">
            <span className="flex items-center gap-2"><Phone size={16} /> 021-00000000</span>
            <span className="flex items-center gap-2"><Mail size={16} /> sales@amadehpack.local</span>
            <span className="flex items-center gap-2"><MapPin size={16} /> تهران، ایران</span>
          </div>
        </section>
      </div>
      <div className="border-t border-[#B8874B]/25 py-5 text-center text-sm text-[#6F6256]">© 2026 Amadeh Pack. طراحی شده برای فروش B2B و B2C.</div>
    </footer>
  );
}


