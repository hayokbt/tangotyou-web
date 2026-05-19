import { NextResponse } from "next/server";
import { authRequests } from "@/data/access";

export async function GET(request: Request) {
  const backendResponse = await fetch(authRequests.bookList, {
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

export async function POST(request: Request) {
  const body = await request.json();
  const backendResponse = await fetch(authRequests.bookList, {
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

export async function DELETE(request: Request) {
  const body = await request.json();
  const backendResponse = await fetch(authRequests.bookList, {
    method: "DELETE",
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
