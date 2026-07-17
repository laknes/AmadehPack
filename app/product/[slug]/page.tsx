import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Factory, PackageCheck, Printer, ShieldCheck } from "lucide-react";
import { ProductOrbit } from "@/components/three/product-orbit";
import { GlassPanel } from "@/components/glass-panel";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/utils";
import { categories, products } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return { title: product?.name ?? "محصول" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);
  const relatedProducts = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);

  return (
    <section className="container section">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-0">
          <div className="relative aspect-square rounded-[28px] bg-[#FFF4DF]">
            <Image src={product.image} alt={product.name} fill className="object-contain p-12" />
          </div>
        </GlassPanel>
        <div>
          <Link href={`/shop?category=${product.category}`} className="text-[#B8874B]">{category?.name ?? product.sku}</Link>
          <h1 className="mt-3 text-4xl font-black leading-tight">{product.name}</h1>
          <p className="mt-3 text-sm text-[#6F6256]">کد کالا: {product.sku}</p>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-bold text-[#4A2F1B]">{formatPrice(product.price)}</p>
            <span className="rounded-full border border-[#B8874B]/25 bg-[#FFF4DF] px-3 py-1 text-sm text-[#6F6256]">{product.unit}</span>
          </div>
          <p className="mt-6 leading-9 text-[#6F6256]">
            {product.material}، مناسب سفارش عمده، چاپ اختصاصی و تامین دوره‌ای برای کافه‌ها، رستوران‌ها و برندهای غذایی.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Link className="btn" href={`/contact?product=${product.slug}`}>استعلام چاپ اختصاصی <Printer size={18} /></Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [product.minOrder, "حداقل سفارش", PackageCheck],
              [product.leadTime, "آماده‌سازی", Clock3],
              ["کنترل قبل ارسال", "کیفیت", ShieldCheck],
            ].map(([value, label, Icon]) => (
              <GlassPanel key={String(label)} className="rounded-3xl p-4">
                <Icon className="mb-3 text-[#FF8A1F]" size={22} />
                <strong className="block">{value as string}</strong>
                <span className="mt-1 block text-sm text-[#6F6256]">{label as string}</span>
              </GlassPanel>
            ))}
          </div>
          <GlassPanel className="mt-8 p-0">
            <ProductOrbit compact />
          </GlassPanel>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="rounded-[28px] p-6">
          <h2 className="text-2xl font-black">مشخصات فنی</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {product.specs.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#B8874B]/20 bg-white p-4">
                <span className="text-sm text-[#6F6256]">{label}</span>
                <strong className="mt-1 block text-[#1C1108]">{value}</strong>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="rounded-[28px] p-6">
          <Factory className="mb-4 text-[#FF8A1F]" size={28} />
          <h2 className="text-2xl font-black">کاربردهای پیشنهادی</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {product.suitableFor.map((item) => (
              <span key={item} className="rounded-full border border-[#B8874B]/20 bg-white px-4 py-2 text-sm text-[#4A2F1B]">{item}</span>
            ))}
          </div>
          <Link href="/contact" className="btn mt-6">دریافت پیش‌فاکتور <ArrowLeft size={18} /></Link>
        </GlassPanel>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[#B8874B]">محصولات مشابه</p>
              <h2 className="mt-2 text-3xl font-black">از همین دسته</h2>
            </div>
            <Link href={`/shop?category=${product.category}`} className="btn">مشاهده دسته</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </div>
      )}
    </section>
  );
}
