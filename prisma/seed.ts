import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL ?? "admin@amadehpack.local";
const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";
const adminName = process.env.ADMIN_NAME ?? "مدیر آماده‌پک";
const adminPhone = process.env.ADMIN_PHONE ?? "09105400104";

const products = [
  ["لیوان ۲۲۰cc یکروکرافت سوئدی", "cup-220-kraft", "CUP-220-KRAFT", "cups", "لیوان اقتصادی ECO با مقوای اروپایی و بسته‌بندی ۲۰۰۰ عددی"],
  ["لیوان VIP ۳۶۰cc سفید مات", "vip-360-white", "VIP-360-WHITE", "cups", "لیوان پریمیوم تک‌جداره با استحکام بالا و ظاهر مینیمال"],
  ["کاسه ۷۵۰cc دورو کرافت", "bowl-750-kraft", "BOWL-750-KRAFT", "bowls", "کاسه کاغذی پریمیوم مناسب سرو غذای گرم و سرد"],
  ["درب پلیمری لیوان VIP", "vip-lid-black", "LID-VIP-BLACK", "lids", "درب پلیمری مشکی طرح لب‌نوش برای لیوان VIP"],
  ["کارتن پیتزا سوئدی ۳۰", "pizza-box-30", "PIZZA-30-SWEDISH", "pizza", "کارتن پیتزای تولیدشده از کاغذ سوئدی ۱۰۰٪ تمیز"],
  ["کاغذ دورپیچ قهوه‌ای راه‌راه", "wrap-paper-striped", "PAPER-STRIPED", "paper", "کاغذ فست‌فود و شیرینی با استاندارد تماس مستقیم با غذا"],
];

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Full administrative access" },
  });
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user", description: "Customer access" },
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      phone: adminPhone || null,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
    create: {
      name: adminName,
      email: adminEmail,
      phone: adminPhone || null,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      roles: { create: [{ roleId: adminRole.id }] },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@amadehpack.local" },
    update: {},
    create: {
      name: "مشتری نمونه",
      email: "customer@amadehpack.local",
      phone: "09120000000",
      passwordHash: await bcrypt.hash("user123456", 10),
      roles: { create: [{ roleId: userRole.id }] },
    },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "amadeh-pack" },
    update: {},
    create: { name: "آماده‌پک", slug: "amadeh-pack", description: "ظروف کرافت و ملزومات بسته‌بندی غذا" },
  });

  const categories = await Promise.all(
    [
      ["لیوان‌های کاغذی", "cups"],
      ["کاسه‌های کاغذی", "bowls"],
      ["درب‌های پلیمری", "lids"],
      ["کارتن پیتزای سوئدی", "pizza"],
      ["کاغذ فست‌فود و شیرینی", "paper"],
    ].map(([name, slug]) =>
      prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug, description: `${name} آماده‌پک` },
      }),
    ),
  );

  const categoryMap = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  for (const [name, slug, sku, categorySlug, description] of products) {
    const product = await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        id: slug,
        name,
        slug,
        sku,
        description,
        price: null,
        isFeatured: true,
        categoryId: categoryMap[categorySlug],
        brandId: brand.id,
        details: { pricing: "استعلام", pack: "مطابق کاتالوگ ۲۰۲۶" },
        images: {
          create: [
            {
              url: `/mock-products/${slug}.svg`,
              alt: name,
              sortOrder: 0,
            },
          ],
        },
        variants: {
          create: [
            {
              name: "سفارش عمده",
              sku: `${sku}-BULK`,
              options: { mode: "bulk", price: "quote" },
            },
          ],
        },
        inventory: { create: { quantity: 500, lowStock: 25 } },
      },
    });

    await prisma.review.create({
      data: {
        rating: 5,
        title: "کیفیت بسیار خوب",
        body: "برای سفارش عمده کیفیت و بسته‌بندی قابل اتکا بود.",
        approved: true,
        userId: customer.id,
        productId: product.id,
      },
    }).catch(() => undefined);
  }

  await prisma.coupon.upsert({
    where: { code: "AMADEH10" },
    update: {},
    create: { code: "AMADEH10", description: "کد نمونه تخفیف", percentOff: 10, active: true },
  });

  await prisma.paymentGateway.upsert({
    where: { provider: "MOCK" },
    update: {},
    create: {
      provider: "MOCK",
      title: "پرداخت آزمایشی",
      sandbox: true,
      active: true,
      callbackUrl: "http://localhost:3000/api/payment/callback",
      settings: { readyForRealGateway: true },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "enamad" },
    update: {},
    create: {
      key: "enamad",
      group: "trust",
      value: {
        enabled: false,
        trustCode: "",
        badgeHtml: "",
        badgeImageUrl: "",
        profileUrl: "https://enamad.ir",
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      group: "general",
      value: {
        siteName: "آماده‌پک",
        supportPhone: "021-00000000",
        supportEmail: "sales@amadehpack.local",
        seoTitle: "آماده‌پک | فروشگاه بسته‌بندی غذا",
        seoDescription: "فروشگاه حرفه‌ای ظروف کاغذی، کرافت، درب و بسته‌بندی غذای آماده.",
        appearance: {
          primaryButtonColor: "#ff8a1f",
          primaryButtonTextColor: "#1c1108",
          buttonColor: "#ffffff",
          buttonTextColor: "#1c1108",
          headingTextColor: "#1c1108",
          bodyTextColor: "#1c1108",
        },
        shipping: {
          defaultMethodId: "standard",
          methods: [
            { id: "standard", title: "ارسال معمولی", description: "ارسال اقتصادی برای سفارش‌های عادی", price: 0, enabled: true },
            { id: "express", title: "ارسال فوری", description: "اولویت پردازش و تحویل سریع‌تر", price: 250000, enabled: true },
            { id: "pickup", title: "تحویل حضوری", description: "هماهنگی با واحد فروش برای دریافت حضوری", price: 0, enabled: false },
          ],
        },
        payment: {
          defaultProvider: "MOCK",
        },
      },
    },
  });

  await prisma.banner.createMany({
    data: [
      { title: "ظروف کرافت صادراتی", subtitle: "کیفیت اروپایی برای برندهای غذایی", placement: "HOME_HERO", ctaLabel: "مشاهده فروشگاه", ctaHref: "/shop" },
      { title: "چاپ اختصاصی لوگو", subtitle: "برای سفارش‌های عمده", placement: "SHOP_TOP", ctaLabel: "استعلام", ctaHref: "/contact" },
    ],
    skipDuplicates: true,
  });

  await prisma.activityLog.create({
    data: { action: "seed.completed", entity: "system", userId: admin.id, metadata: { products: products.length } },
  });
}

main()
  .finally(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
