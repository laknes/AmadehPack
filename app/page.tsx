import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Boxes,
  ClipboardList,
  CupSoda,
  Factory,
  HelpCircle,
  Layers3,
  Package,
  Pizza,
  PhoneCall,
  ScrollText,
  ShieldCheck,
  Soup,
  Sparkles,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { GlassPanel } from "@/components/glass-panel";
import { HeroSlider } from "@/components/hero-slider";
import { posts, products } from "@/lib/data";

const categoryCards = [
  { slug: "cups", title: "لیوان کاغذی", text: "تک‌لایه و دولایه، چند سایز", Icon: CupSoda },
  { slug: "bowls", title: "کاسه کاغذی", text: "مناسب غذای بیرون‌بر", Icon: Soup },
  { slug: "lids", title: "درب و متعلقات", text: "درب، هم‌زن و نی", Icon: Package },
  { slug: "pizza", title: "کارتن پیتزا", text: "چند سایز استاندارد", Icon: Pizza },
  { slug: "paper", title: "کاغذ دورپیچ", text: "رول و برش‌خورده", Icon: ScrollText },
];

const faq = [
  ["حداقل سفارش چقدر است؟", "برای محصولات کاتالوگی امکان ثبت سفارش عمده وجود دارد و برای چاپ اختصاصی تیراژ بر اساس نوع محصول محاسبه می‌شود."],
  ["چاپ اختصاصی لوگو انجام می‌دهید؟", "بله، اطلاعات چاپ، فایل طراحی و پیش‌فاکتور از طریق پنل مدیریت و فرم تماس قابل پیگیری است."],
  ["قیمت‌ها نهایی هستند؟", "قیمت‌های سایت برای شروع سفارش هستند؛ سفارش عمده، چاپ و ارسال می‌تواند پیش‌فاکتور جدا داشته باشد."],
  ["پرداخت آنلاین فعال است؟", "پرداخت mock پیاده‌سازی شده و ساختار درگاه واقعی، اینماد و Neon Database آماده اتصال است."],
];

export default function HomePage() {
  const featured = products.filter((product) => product.featured);

  return (
    <>
      <section className="container grid min-h-[calc(100vh-80px)] items-center gap-8 py-10 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-[#B8874B]/30 bg-[#FFF4DF] px-4 py-2 text-sm text-[#B8874B]">کاتالوگ ۲۰۲۶ آماده‌پک، آماده فروش آنلاین</div>
          <h1 className="neon-text text-5xl font-black leading-tight md:text-7xl">فروشگاه کامل بسته‌بندی غذا برای سفارش عمده و آنلاین</h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-[#6F6256]">لیوان، کاسه، کارتن پیتزا، درب و کاغذ دورپیچ با مسیر کامل خرید، چاپ اختصاصی، پیش‌فاکتور، پرداخت، پیگیری سفارش و پنل مدیریتی.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary btn">شروع خرید <ArrowLeft size={18} /></Link>
            <Link href="/contact" className="btn">استعلام عمده</Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[["ارسال عمده", Truck], ["کنترل کیفیت", ShieldCheck], ["چاپ اختصاصی", Sparkles]].map(([label, Icon]) => (
              <GlassPanel key={String(label)} className="rounded-3xl p-4">
                <Icon className="mb-3 text-[#FF8A1F]" size={22} />
                <strong>{label as string}</strong>
              </GlassPanel>
            ))}
          </div>
        </div>
        <HeroSlider />
      </section>

      <section className="bg-[#EFE6D0] px-4 py-10">
        <div className="category-banner">
          <div className="category-banner__head">
            <div>
              <span className="category-banner__eyebrow">
                <Boxes size={14} />
                دسته‌بندی محصولات
              </span>
              <h2 className="category-banner__title">هرچی برای بسته‌بندی نیاز دارید، <span>یک‌جا</span></h2>
            </div>
            <Link href="/shop" className="category-banner__see-all">
              مشاهده همه محصولات
              <ArrowLeft size={16} />
            </Link>
          </div>

          <div className="category-banner__grid">
            {categoryCards.map(({ slug, title, text, Icon }) => (
              <Link key={slug} href={`/shop?category=${slug}`} className="category-banner__card">
                <span className="category-banner__arrow" aria-hidden="true">
                  <ArrowUpLeft size={14} />
                </span>
                <span className="category-banner__icon" aria-hidden="true">
                  <Icon size={30} strokeWidth={1.7} />
                </span>
                <h3>{title}</h3>
                <span>{text}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[#B8874B]">محصولات ویژه</p>
              <h2 className="mt-2 text-3xl font-black">انتخاب‌های پرفروش کاتالوگ</h2>
            </div>
            <Link href="/shop" className="btn">همه محصولات</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>

      <section className="bg-[#EFE6D0] px-4 py-10">
        <div className="features-banner features-banner--image">
          <span className="features-banner__fleck f1" aria-hidden="true" />
          <span className="features-banner__fleck f2" aria-hidden="true" />
          <span className="features-banner__fleck f3" aria-hidden="true" />
          <span className="features-banner__fleck f4" aria-hidden="true" />
          <div className="features-banner__image-wrap">
            <Image
              src="/features-banner.png"
              alt="بنر سفارش عمده و فروش آنلاین بسته‌بندی"
              width={2048}
              height={1014}
              sizes="(max-width: 1180px) 100vw, 1180px"
              className="features-banner__image"
            />
            <Link href="/contact" className="features-banner__hotspot quote" aria-label="پیش‌فاکتور سریع" />
            <Link href="/contact" className="features-banner__hotspot print" aria-label="چاپ اختصاصی" />
            <Link href="/admin/inventory" className="features-banner__hotspot inventory" aria-label="موجودی و انبار" />
            <Link href="/orders" className="features-banner__hotspot shipping" aria-label="ارسال و پیگیری" />
            <Link href="/about" className="features-banner__hotspot quality" aria-label="ضمانت کیفیت" />
            <Link href="/shop" className="features-banner__hotspot price" aria-label="قیمت رقابتی" />
            <Link href="/contact" className="features-banner__hotspot support" aria-label="پشتیبانی حرفه‌ای" />
            <Link href="/contact" className="features-banner__hotspot cta" aria-label="همین حالا سفارش دهید" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[#B8874B]">مسیر سفارش</p>
            <h2 className="mt-2 text-3xl font-black">از انتخاب محصول تا چاپ اختصاصی</h2>
            <p className="mt-4 leading-8 text-[#6F6256]">برای اینکه سایت فقط زیبا نباشد و واقعاً بفروشد، مسیر سفارش عمده، چاپ، پیش‌فاکتور و پرداخت در ساختار فنی و UI دیده شده است.</p>
            <Link href="/contact" className="btn-primary btn mt-6">درخواست مشاوره <PhoneCall size={18} /></Link>
          </div>
          <div className="grid gap-3">
            {[
              ["۱", "انتخاب دسته و محصول", "لیوان، کاسه، درب، کارتن یا کاغذ دورپیچ را انتخاب کنید."],
              ["۲", "ثبت تیراژ و نیاز چاپ", "اگر چاپ اختصاصی دارید، اطلاعات برند و فایل طرح ثبت می‌شود."],
              ["۳", "پیش‌فاکتور و تایید", "مدیر فروش قیمت، زمان آماده‌سازی و وضعیت موجودی را تایید می‌کند."],
              ["۴", "پرداخت و پیگیری", "پرداخت mock آماده اتصال به درگاه واقعی است و سفارش قابل پیگیری می‌شود."],
            ].map(([step, title, text]) => (
              <div key={step} className="grid gap-4 rounded-[20px] border border-[#B8874B] bg-white p-4 sm:grid-cols-[56px_1fr]">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#FF8A1F] font-black text-[#1c1108]">{step}</span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-[#6F6256]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#F6EAD9]">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[#B8874B]">راهنمای انتخاب</p>
              <h2 className="mt-2 text-3xl font-black">کدام محصول برای کسب‌وکار شما مناسب است؟</h2>
            </div>
            <Link href="/shop" className="btn">ورود به فروشگاه</Link>
          </div>
          <div className="overflow-x-auto rounded-[24px] border border-[#B8874B]">
            <table className="w-full min-w-[760px] border-collapse bg-white text-sm">
              <thead className="bg-[#4A2F1B] text-[#FFF4DF]">
                <tr>
                  {["کاربرد", "پیشنهاد آماده‌پک", "مزیت", "اقدام"].map((head) => <th key={head} className="p-4 text-right">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ["کافه و بیرون‌بر", "لیوان VIP و درب پلیمری", "ظاهر حرفه‌ای و تجربه بهتر نوشیدن", "/shop?category=cups"],
                  ["رستوران و سالادبار", "کاسه کاغذی کرافت/سفید", "مناسب غذای سرد و گرم", "/shop?category=bowls"],
                  ["پیتزا و فست‌فود", "کارتن پیتزای سوئدی", "حمل امن و ظاهر تمیز", "/shop?category=pizza"],
                  ["ساندویچ و شیرینی", "کاغذ دورپیچ", "تماس مستقیم با غذا و مصرف سریع", "/shop?category=paper"],
                ].map(([use, product, benefit, href]) => (
                  <tr key={use} className="border-t border-[#B8874B]/60">
                    <td className="p-4 font-bold">{use}</td>
                    <td className="p-4 text-[#4A2F1B]">{product}</td>
                    <td className="p-4 text-[#6F6256]">{benefit}</td>
                    <td className="p-4"><Link className="btn" href={href}>مشاهده</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="rounded-[24px] border-[#B8874B] bg-white">
            <Factory className="mb-5 text-[#FF8A1F]" size={30} />
            <h2 className="text-3xl font-black">اعتمادسازی برای خرید عمده</h2>
            <p className="mt-4 leading-8 text-[#6F6256]">ساختار سایت برای نمایش کاتالوگ، تولید، کیفیت، چاپ اختصاصی، سبد خرید، پیش‌فاکتور، درگاه پرداخت، اینماد و پیگیری سفارش آماده شده است.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[["۶", "دسته محصول"], ["۵۶", "مسیر صفحه/API"], ["۲", "نقش کاربری"]].map(([value, label]) => (
                <div key={label} className="rounded-[18px] border border-[#B8874B] bg-[#FFF4DF] p-4">
                  <strong className="text-2xl text-[#005D21]">{value}</strong>
                  <p className="mt-1 text-sm text-[#6F6256]">{label}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
          <div className="grid gap-3">
            {[
              ["امنیت پنل مدیریت", ShieldCheck],
              ["تنظیمات اینماد و درگاه", BadgeCheck],
              ["سطح دسترسی و لاگ مدیران", ClipboardList],
              ["سئو، sitemap و محتوای بلاگ", Layers3],
            ].map(([title, Icon]) => (
              <div key={String(title)} className="flex items-center gap-4 rounded-[20px] border border-[#B8874B] bg-white p-4">
                <Icon className="text-[#FF8A1F]" size={24} />
                <span className="font-bold">{title as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[#F6EAD9]">
        <div className="container grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-[#B8874B]">سوالات پرتکرار</p>
            <h2 className="mt-2 text-3xl font-black">قبل از سفارش چه چیزهایی مهم است؟</h2>
          </div>
          <div className="grid gap-3">
            {faq.map(([q, a]) => (
              <details key={q} className="rounded-[18px] border border-[#B8874B] bg-white p-4">
                <summary className="flex cursor-pointer list-none items-center gap-3 font-bold"><HelpCircle className="text-[#FF8A1F]" size={20} />{q}</summary>
                <p className="mt-3 leading-8 text-[#6F6256]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[#B8874B]">مجله و راهنما</p>
              <h2 className="mt-2 text-3xl font-black">محتوا برای انتخاب بهتر و سئو قوی‌تر</h2>
            </div>
            <Link href="/blog" className="btn">همه مقاله‌ها</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-[22px] border border-[#B8874B] bg-white p-5 transition hover:border-[#FF8A1F]">
                <p className="text-sm text-[#B8874B]">راهنمای خرید</p>
                <h3 className="mt-3 text-lg font-bold leading-8">{post.title}</h3>
                <p className="mt-3 leading-7 text-[#6F6256]">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container rounded-[28px] border border-[#B8874B] bg-white p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[#B8874B]">آماده سفارش عمده هستید؟</p>
              <h2 className="mt-2 text-3xl font-black">محصول، تیراژ و چاپ را انتخاب کنید؛ بقیه مسیر در پنل قابل مدیریت است.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary btn">شروع خرید <ArrowLeft size={18} /></Link>
              <Link href="/contact" className="btn">تماس با فروش</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}



