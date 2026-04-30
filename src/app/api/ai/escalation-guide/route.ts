import { NextResponse } from "next/server";
import { executeAIModule } from "@/lib/ai/gateway";

export async function GET() {
  const response = await executeAIModule("escalation-guide");

  return NextResponse.json(response);
}
