import { NextResponse } from "next/server";
import { messageNudgesEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(messageNudgesEnvelope);
}
