import { NextResponse } from "next/server";
import { requests } from "@/data/access";

export async function GET() {
  const response = await fetch(requests.get1Word);
  if (!response.ok) {
    return NextResponse.json(
      { error: "バックエンドから単語を取得できませんでした" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
