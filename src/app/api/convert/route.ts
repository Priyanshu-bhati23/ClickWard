import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const { variantId } = await request.json();

    if (!variantId || typeof variantId !== "string") {
      return NextResponse.json({ error: "Invalid variantId" }, { status: 400 });
    }

    await prisma.variant.update({
      where: { id: variantId },
      data: { conversions: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
