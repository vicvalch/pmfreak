import { NextResponse } from "next/server";
import { runAIModule } from "@/lib/ai/gateway";

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { rawMessage, audience } for message nudges." },
    { status: 405 },
  );
}

export async function POST(request: Request) {
  let payload: { rawMessage?: string; audience?: string; projectId?: string };

  try {
    payload = (await request.json()) as { rawMessage?: string; audience?: string; projectId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const response = await runAIModule({
      moduleId: "message-nudges",
      input: payload,
      context: {
        projectId: payload.projectId?.trim() || "demo-project",
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process message nudges.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
