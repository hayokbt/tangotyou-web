import { NextResponse } from "next/server";
import { authRequests } from "@/data/access";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  const { bookName } = await params;
  const backendUrl = `${authRequests.wordBase}/${encodeURIComponent(bookName)}/words`;

  const backendResponse = await fetch(backendUrl, {
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  const { bookName } = await params;
  const body = await request.json();
  const backendUrl = `${authRequests.wordBase}/${encodeURIComponent(bookName)}/words`;

  const backendResponse = await fetch(backendUrl, {
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  const { bookName } = await params;
  const body = await request.json();
  const backendUrl = `${authRequests.wordBase}/${encodeURIComponent(bookName)}/words`;

  const backendResponse = await fetch(backendUrl, {
    method: "PUT",
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bookName: string }> }
) {
  const { bookName } = await params;
  const body = await request.json();
  const backendUrl = `${authRequests.wordBase}/${encodeURIComponent(bookName)}/words`;

  const backendResponse = await fetch(backendUrl, {
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
