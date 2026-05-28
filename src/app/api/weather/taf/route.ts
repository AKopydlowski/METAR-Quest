import { NextRequest, NextResponse } from "next/server";
import { getLatestTaf } from "@/lib/weather/aviationWeatherClient";

export async function GET(request: NextRequest) {
  const station = request.nextUrl.searchParams.get("station")?.trim().toUpperCase();

  if (!station) {
    return NextResponse.json(
      { error: "Missing required query parameter: station" },
      { status: 400 },
    );
  }

  if (!/^[A-Z]{4}$/.test(station)) {
    return NextResponse.json(
      { error: "Station must be a 4-letter ICAO code" },
      { status: 400 },
    );
  }

  const taf = await getLatestTaf(station);
  return NextResponse.json({ station, taf });
}
