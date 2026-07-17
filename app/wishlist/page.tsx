import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data";

export const metadata = { title: "علاقه‌مندی‌ها" };

export default function WishlistPage() {
  return (
    <section className="container section">
      <h1 className="mb-8 text-4xl font-black">علاقه‌مندی‌ها</h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

