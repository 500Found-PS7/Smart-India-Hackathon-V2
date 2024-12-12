import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function requireAuth(request) {
  const { userId } = getAuth(request);

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
} 