import { NextResponse } from "next/server";
import { authRequests } from "@/data/access";

export async function GET(request: Request) {
  const backendResponse = await fetch(authRequests.me, {
    method: "GET",
    headers: {
      Cookie: request.headers.get("cookie") ?? "",
    },
  });

  const responseData = await backendResponse.json().catch(() => ({ error: "backend error" }));
  const response = NextResponse.json(responseData, { status: backendResponse.status });
  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("Set-Cookie", setCookie);
  }
  return response;
}
