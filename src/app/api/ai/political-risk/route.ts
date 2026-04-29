import { NextResponse } from "next/server";
import { politicalRiskEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(politicalRiskEnvelope);
}
