import { Clock3, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata = { title: "تماس با ما" };

export default function ContactPage() {
  return (
    <section className="container section grid gap-6 lg:grid-cols-[1fr_380px]">
      <ContactForm />
      <aside className="glass h-fit rounded-[28px] p-6 leading-9 text-[#6F6256]">
        <h2 className="mb-4 text-xl font-bold text-[#1C1108]">اطلاعات تماس</h2>
        <div className="grid gap-3">
          <p className="flex items-center gap-2"><Phone size={18} className="text-[#FF8A1F]" /> تلفن: 021-00000000</p>
          <p className="flex items-center gap-2"><Mail size={18} className="text-[#FF8A1F]" /> ایمیل: sales@amadehpack.local</p>
          <p className="flex items-center gap-2"><MapPin size={18} className="text-[#FF8A1F]" /> آدرس: تهران، ایران</p>
        </div>
        <div className="mt-6 grid gap-3 border-t border-[#B8874B]/25 pt-5">
          {[
            [Clock3, "پاسخ‌گویی سفارش‌های عمده در همان روز کاری"],
            [ShieldCheck, "صدور پیش‌فاکتور با قیمت، تیراژ، ارسال و شرایط چاپ"],
          ].map(([Icon, text]) => (
            <div key={String(text)} className="rounded-2xl border border-[#B8874B]/20 bg-white p-4 text-sm leading-7">
              <Icon className="mb-2 text-[#005D21]" size={20} />
              {text as string}
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

