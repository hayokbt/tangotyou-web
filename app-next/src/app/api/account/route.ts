import { NextResponse } from "next/server";
import { createRequests } from "@/data/access";

export async function POST(request: Request) {
  const body = await request.json();
  const resp = await fetch(createRequests.createAccount, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "backend error" }));
    return NextResponse.json(err, { status: resp.status });
  }

  const data = await resp.json();
  return NextResponse.json({ ...data, success: true });
}