import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://gamma-api.polymarket.com/events?closed=false",
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Polymarket fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}
