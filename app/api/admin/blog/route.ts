import { NextResponse } from "next/server";
import { forbidden, logActivity, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validators";

export async function GET() {
  if (!(await requireAdmin())) return forbidden();
  const items = await prisma.blogPost.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return forbidden();
  const parsed = blogPostSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const item = await prisma.blogPost.create({ data: { ...parsed.data, authorId: parsed.data.authorId || session.user.id } });
  await logActivity("blog.create", "BlogPost", item.id);
  return NextResponse.json(item, { status: 201 });
}
