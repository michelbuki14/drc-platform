import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");

  const where = category ? { category } : {};
  const services = await prisma.service.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { name, description, category, priceFromUsd, icon } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "name and category required" }, { status: 400 });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  const service = await prisma.service.create({
    data: {
      slug,
      name,
      description: description || "",
      category,
      priceFromUsd: priceFromUsd ? Number(priceFromUsd) : null,
      icon: icon || null,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
