import { NextResponse } from "next/server";
import { projectMemoryEnvelope } from "@/lib/ai/mock-data";

export async function GET() {
  return NextResponse.json(projectMemoryEnvelope);
}
