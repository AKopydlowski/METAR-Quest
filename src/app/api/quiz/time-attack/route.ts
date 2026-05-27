import { NextResponse } from "next/server";
import { parseMetar } from "@/lib/metar/parser";
import { buildDynamicQuestionBank, buildQuestionBank } from "@/lib/metar/questions";

const STATIONS = [
  "KJFK", "KLAX", "KSFO", "KORD", "KATL", "KSEA", "KDEN", "KMIA", "KPHX", "KBOS",
  "EGLL", "EDDF", "LFPG", "EHAM", "LEMD", "RJTT", "YSSY", "CYYZ", "OMDB", "VHHH",
];

const BASE_URL = "https://aviationweather.gov/api/data/metar";

async function fetchRawMetars() {
  const ids = STATIONS.join(",");
  const url = `${BASE_URL}?ids=${encodeURIComponent(ids)}&format=raw&taf=false`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch dynamic METARs: ${response.status}`);
  }

  const text = await response.text();
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 80);
}

export async function GET() {
  try {
    const raws = await fetchRawMetars();
    const entries = raws.map((raw, index) => {
      const parsed = parseMetar(raw);
      return { id: `${parsed.station.toLowerCase()}-${index}`, rawText: raw, metar: parsed };
    });
    const questions = buildDynamicQuestionBank(entries);
    return NextResponse.json({ source: "live-api", count: questions.length, questions });
  } catch {
    const fallback = buildQuestionBank();
    return NextResponse.json({ source: "fallback-local", count: fallback.length, questions: fallback });
  }
}
