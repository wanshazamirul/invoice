import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "up",
    app: "invoice",
    response_ms: 0,
    timestamp: new Date().toISOString(),
  });
}
