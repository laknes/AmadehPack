import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "name", "featured"]).default("newest"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8).optional(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  sku: z.string().min(2),
  description: z.string().min(8),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1), price: z.number().nonnegative() })).min(1),
  customer: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    city: z.string().min(2),
    addressLine: z.string().min(5),
  }),
  shippingMethodId: z.string().min(1).default("standard"),
  shippingCost: z.coerce.number().nonnegative().default(0),
  paymentProvider: z.enum(["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"]).default("MOCK"),
  notes: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const couponSchema = z.object({
  code: z.string().min(2).transform((value) => value.toUpperCase()),
  description: z.string().optional().nullable(),
  percentOff: z.coerce.number().int().min(1).max(100).optional().nullable(),
  amountOff: z.coerce.number().nonnegative().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  active: z.boolean().default(true),
});

export const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  placement: z.enum(["HOME_HERO", "HOME_FEATURED", "SHOP_TOP", "ADMIN_NOTICE"]),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const blogPostSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  excerpt: z.string().min(2),
  content: z.string().min(2),
  coverUrl: z.string().optional().nullable(),
  published: z.boolean().default(false),
  authorId: z.string().min(1).optional(),
});

export const inventorySchema = z.object({
  productId: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0).default(0),
  reserved: z.coerce.number().int().min(0).default(0),
  lowStock: z.coerce.number().int().min(0).default(10),
});

export const reviewModerationSchema = z.object({
  approved: z.boolean(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELED"]),
});

export const paymentGatewaySchema = z.object({
  provider: z.enum(["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"]),
  title: z.string().min(2),
  merchantId: z.string().optional().nullable(),
  terminalId: z.string().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  callbackUrl: z.string().url().optional().nullable(),
  sandbox: z.boolean().default(true),
  active: z.boolean().default(false),
  settings: z.record(z.unknown()).optional(),
});

export const paymentRequestSchema = z.object({
  orderId: z.string().min(1),
  provider: z.enum(["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"]).default("MOCK"),
});

export const enamadSchema = z.object({
  enabled: z.boolean().default(false),
  trustCode: z.string().optional().nullable(),
  badgeHtml: z.string().optional().nullable(),
  badgeImageUrl: z.string().optional().nullable(),
  profileUrl: z.string().url().optional().nullable(),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().optional(),
  supportPhone: z.string().optional(),
  supportEmail: z.union([z.string().email(), z.literal("")]).optional(),
  address: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  appearance: z.object({
    primaryButtonColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    primaryButtonTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    buttonColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    buttonTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    headingTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    bodyTextColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  }).optional(),
  shipping: z.object({
    defaultMethodId: z.string().min(1),
    methods: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(2),
      description: z.string().optional(),
      price: z.coerce.number().nonnegative(),
      enabled: z.boolean(),
    })).min(1),
  }).optional(),
  payment: z.object({
    defaultProvider: z.enum(["MOCK", "ZARINPAL", "IDPAY", "PAYIR", "SEP", "BEHPARDAKHT", "SADAD"]),
  }).optional(),
});
