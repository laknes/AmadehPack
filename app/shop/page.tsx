import { ProductCard } from "@/components/product-card";
import { GlassPanel } from "@/components/glass-panel";
import { categories, products } from "@/lib/data";

export const metadata = { title: "فروشگاه" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category ?? "all";
  const selectedCategory = categories.find((item) => item.slug === category);
  const list = products
    .filter((product) => (category === "all" ? true : product.category === category))
    .filter((product) => (q ? product.name.includes(q) || product.sku.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => {
      if (params.sort === "price") return a.price - b.price;
      if (params.sort === "price-desc") return b.price - a.price;
      return a.name.localeCompare(b.name, "fa");
    });

  return (
    <section className="container section">
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[#B8874B]">فروشگاه</p>
          <h1 className="mt-2 text-4xl font-black">جستجو، فیلتر و سفارش محصولات</h1>
          <p className="mt-4 max-w-2xl leading-8 text-[#6F6256]">
            {selectedCategory?.description ?? "کاتالوگ محصولات آماده ارسال، قابل استعلام عمده و قابل اتصال به چاپ اختصاصی."}
          </p>
        </div>
        <div className="rounded-2xl border border-[#B8874B]/20 bg-[#FFF4DF] px-4 py-3 text-sm text-[#4A2F1B]">
          {list.length} محصول پیدا شد
        </div>
      </div>
      <form className="glass mb-8 grid gap-3 rounded-[28px] p-4 md:grid-cols-[1fr_220px_180px_120px]">
        <input className="field" name="q" placeholder="جستجوی نام یا SKU" defaultValue={q} />
        <select className="field" name="category" defaultValue={category}>
          <option value="all">همه دسته‌ها</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
        </select>
        <select className="field" name="sort" defaultValue={params.sort ?? "name"}>
          <option value="name">مرتب‌سازی نام</option>
          <option value="price">ارزان‌ترین</option>
          <option value="price-desc">گران‌ترین</option>
        </select>
        <button className="btn-primary btn" type="submit">اعمال</button>
      </form>
      {list.length === 0 && (
        <GlassPanel className="mb-8 rounded-[28px] p-8 text-center">
          <h2 className="text-2xl font-black">محصولی با این فیلتر پیدا نشد</h2>
          <p className="mt-3 text-[#6F6256]">عبارت جستجو را کوتاه‌تر کنید یا همه دسته‌ها را ببینید.</p>
          <a href="/shop" className="btn-primary btn mt-5">پاک کردن فیلترها</a>
        </GlassPanel>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

