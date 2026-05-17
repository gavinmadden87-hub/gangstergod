import { NextResponse, type NextRequest } from "next/server";
import { callProcedure } from "../../../../lib/server/trpc-router";
import { isTrpcProcedure } from "../../../../lib/trpc";

type RouteContext = {
  params: Promise<{
    procedure: string;
  }>;
};

export async function POST(_request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { procedure } = await context.params;

  if (!isTrpcProcedure(procedure)) {
    return NextResponse.json(
      { error: `Unknown tRPC procedure: ${procedure}` },
      { status: 404 },
    );
  }

  try {
    const data = await callProcedure(procedure);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`[tRPC:${procedure}]`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown tRPC failure" },
      { status: 500 },
    );
  }
}
