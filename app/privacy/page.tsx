export const metadata = { title: "قوانین و حریم خصوصی" };

export default function PrivacyPage() {
  return (
    <section className="container section max-w-3xl">
      <h1 className="text-4xl font-black">قوانین و حریم خصوصی</h1>
      <div className="glass mt-8 rounded-[28px] p-6 leading-9 text-[#6F6256]">
        <p>اطلاعات کاربران فقط برای پردازش سفارش، پشتیبانی، ارسال و بهبود تجربه خرید استفاده می‌شود.</p>
        <p className="mt-4">پرداخت فعلی mock است و ساختار Payment برای اتصال به درگاه واقعی آماده شده است.</p>
      </div>
    </section>
  );
}

