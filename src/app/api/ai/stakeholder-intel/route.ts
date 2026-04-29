import { NextResponse } from "next/server";
import { stakeholderIntelEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(stakeholderIntelEnvelope);
}
