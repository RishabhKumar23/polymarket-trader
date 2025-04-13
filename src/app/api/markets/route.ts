import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [polyRes, igRes] = await Promise.all([
      fetch("https://gamma-api.polymarket.com/events?closed=false"),
      fetch("https://ifgames.win/api/v2/events"),
    ]);

    if (!polyRes.ok || !igRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data" },
        { status: 500 }
      );
    }

    const polyData = await polyRes.json();
    const igData = await igRes.json();

    return NextResponse.json({ polyData, igData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
