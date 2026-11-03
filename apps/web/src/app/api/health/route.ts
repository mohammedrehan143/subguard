import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "subguard-web",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
