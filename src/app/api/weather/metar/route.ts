import { NextRequest, NextResponse } from "next/server";
import { getLatestMetar, getLatestTaf } from "@/lib/weather/aviationWeatherClient";

export async function GET(request: NextRequest) {
  const station = request.nextUrl.searchParams.get("station")?.trim().toUpperCase();
  const includeTaf = request.nextUrl.searchParams.get("taf") === "true";

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

  try {
    const metar = await getLatestMetar(station);
    const taf = includeTaf ? await getLatestTaf(station) : undefined;
    return NextResponse.json({ station, metar, taf });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch METAR",
      },
      { status: 502 },
    );
  }
}
