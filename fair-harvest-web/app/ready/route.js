import { NextResponse } from "next/server";
import { prisma } from "../../lib/server/db.js";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ success: true, data: { status: "ready" }, message: "Ready" });
  } catch {
    return NextResponse.json({ success: false, data: { status: "not_ready" }, message: "Database unavailable" }, { status: 503 });
  }
}
