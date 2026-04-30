import { NextResponse } from "next/server";
import { executeAIModule } from "@/lib/ai/gateway";

export async function GET() {
  const response = await executeAIModule("message-nudges");

  return NextResponse.json(response);
}
