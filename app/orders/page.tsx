export const metadata = { title: "پیگیری سفارش" };

export default function OrdersPage() {
  return (
    <section className="container section">
      <div className="glass max-w-2xl rounded-[28px] p-6">
        <h1 className="text-3xl font-black">پیگیری سفارش</h1>
        <p className="mt-3 leading-8 text-[#6F6256]">شماره سفارش ثبت‌شده در مرحله پرداخت mock را وارد کنید تا وضعیت سفارش نمایش داده شود.</p>
        <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_140px]">
          <input className="field" placeholder="مثلا AP-20260707-1001" />
          <button className="btn-primary btn">پیگیری</button>
        </form>
      </div>
    </section>
  );
}

