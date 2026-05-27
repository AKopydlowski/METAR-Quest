import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const station = request.nextUrl.searchParams.get("station")?.trim().toUpperCase();

  if (!station) {
    return NextResponse.json(
      { error: "Missing required query parameter: station" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    station,
    metar: null,
    message: "No METAR data available yet.",
  });
}
