import { NextResponse } from "next/server";
import { meetingsEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(meetingsEnvelope);
}
