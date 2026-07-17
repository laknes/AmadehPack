# Amadeh Pack Commerce

فروشگاه حرفه‌ای آماده‌پک با Next.js 15، TypeScript، TailwindCSS، Framer Motion، React Three Fiber، Prisma، PostgreSQL، NextAuth، Zustand و Zod.

## امکانات

- طراحی RTL، responsive، گلاس‌مورفیسم، نئون، 3D و micro-interaction
- صفحات خانه، فروشگاه، محصول، سبد خرید، تسویه حساب، پنل کاربری، پیگیری سفارش، علاقه‌مندی‌ها، بلاگ، درباره، تماس و قوانین
- پنل مدیریت برای محصولات، تصاویر، دسته‌بندی‌ها، موجودی، سفارش‌ها، کاربران، کوپن، بنر، نظرات، بلاگ، تنظیمات، نقش‌ها و لاگ فعالیت
- دیتابیس Prisma شامل User, Role, Product, Category, Brand, ProductImage, ProductVariant, Inventory, Order, OrderItem, Cart, CartItem, Wishlist, Review, Coupon, Payment, ShippingAddress, BlogPost, Banner, ActivityLog
- NextAuth با نقش admin/user
- APIهای CRUD، validation با Zod، پرداخت mock، cart پایدار با Zustand، sitemap و robots
- APIهای مدیریت درگاه پرداخت، callback/verify پرداخت، تنظیمات اینماد و تنظیمات سایت

## راه‌اندازی

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## نصب خودکار روی سرور

روی سرور لینوکسی، بعد از انتقال پروژه:

```bash
chmod +x install.sh
./install.sh
```

اسکریپت دامنه، `DATABASE_URL`، تنظیمات NextAuth، مسیر آپلود، اطلاعات ادمین، اجرای `prisma db push`، seed اولیه، build production، سرویس `systemd` و در صورت تایید reverse proxy با nginx را مرحله‌به‌مرحله تنظیم می‌کند.

آدرس پیش‌فرض:

```txt
http://localhost:3000
```

## حساب‌های seed

```txt
Admin:
email: admin@amadehpack.local
password: admin123456

User:
email: customer@amadehpack.local
password: user123456
```

## متغیرهای محیطی

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/amadeh_pack?schema=public"
NEXTAUTH_SECRET="change-me"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Neon Database

برای Neon، مقدار `DATABASE_URL` را از pooled connection و با `sslmode=require` قرار بدهید:

```env
DATABASE_URL="postgresql://USER:PASSWORD@ep-example-pooler.REGION.aws.neon.tech/amadeh_pack?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@ep-example.REGION.aws.neon.tech/amadeh_pack?sslmode=require"
```

در این پروژه Prisma Client با Neon PostgreSQL سازگار است. Prisma از `DATABASE_URL` برای runtime و از `DIRECT_URL` برای عملیات schema مثل `db push` استفاده می‌کند. فایل آماده `.env.neon.example` هم در ریشه پروژه قرار دارد.

مراحل راه‌اندازی:

```bash
cp .env.neon.example .env
```

سپس مقدارهای `DATABASE_URL` و `DIRECT_URL` را از داشبورد Neon جایگزین کنید. `install.sh` اگر URL مربوط به Neon باشد، نبودن `sslmode=require` را خودش اصلاح می‌کند و برای pooled URL مقدار `pgbouncer=true` را هم اضافه می‌کند. برای ساخت schema و seed:

```bash
npm run db:push
npm run db:seed
```

## APIهای پرداخت و اینماد

- `GET /api/payment/gateways`: درگاه‌های فعال برای کاربر
- `POST /api/payment/request`: ساخت تراکنش و دریافت `redirectUrl`
- `GET|POST /api/payment/callback`: callback/verify پرداخت
- `GET|POST /api/admin/payment-gateways`: مدیریت درگاه‌ها
- `PATCH|DELETE /api/admin/payment-gateways/:id`: ویرایش/حذف درگاه
- `GET|PUT /api/admin/enamad`: تنظیمات نشان اینماد
- `GET|PUT /api/admin/settings`: تنظیمات عمومی سایت

درگاه‌ها فعلا adapter آماده mock دارند و ساختار provider برای اتصال زرین‌پال، IDPay، Pay.ir و PSPهای بانکی آماده شده است.

## ساختار مهم

- `app/`: صفحات، API routeها، sitemap و error/loading states
- `components/`: UI، هدر/فوتر، پنل مدیریت و صحنه 3D
- `lib/`: Prisma، auth، validation، utils و fallback data
- `prisma/`: schema و seed data
- `store/`: Zustand cart store

## اتصال آپلود واقعی

مسیر `app/api/upload/route.ts` فعلا mock است. برای production می‌توانید آن را به S3، MinIO، Cloudflare R2 یا local object storage وصل کنید و URL برگشتی را در `ProductImage` ذخیره کنید.
