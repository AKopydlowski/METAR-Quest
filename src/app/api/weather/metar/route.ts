import { NextRequest, NextResponse } from "next/server";
import { getLatestMetar } from "@/lib/weather/aviationWeatherClient";

export async function GET(request: NextRequest) {
  const station = request.nextUrl.searchParams.get("station")?.trim().toUpperCase();

  if (!station) {
    return NextResponse.json(
      { error: "Missing required query parameter: station" },
      { status: 400 },
    );
  }

  try {
    const metar = await getLatestMetar(station);
    return NextResponse.json({ station, metar });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch METAR",
      },
      { status: 502 },
    );
  }
}
