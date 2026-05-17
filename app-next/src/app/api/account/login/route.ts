import { NextResponse } from "next/server";
import { authRequests } from "@/data/access";

export async function POST(request: Request) {
  const body = await request.json();
  const backendResponse = await fetch(authRequests.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(body),
  });

  const responseData = await backendResponse.json().catch(() => ({ error: "backend error" }));
  const response = NextResponse.json(responseData, { status: backendResponse.status });

  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  }

  return response;
}
