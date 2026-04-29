import { NextResponse } from "next/server";
import { escalationGuideEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(escalationGuideEnvelope);
}
