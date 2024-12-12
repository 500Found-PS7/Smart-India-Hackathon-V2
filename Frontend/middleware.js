import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/sign-in*", "/sign-up*", "/api/load-data"];

function isPublic(path) {
  return publicPaths.some((x) =>
    path.match(new RegExp(`^${x}$`.replace("*$", "($|/)")))
  );
}

export const config = {
  matcher: ["/((?!static|.*\\..*|_next|favicon.ico).*)", "/"],
  runtime: "edge", // Explicitly specify Edge Runtime
};

export default clerkMiddleware((request) => {
  const url = request.nextUrl || new URL(request.url); // Fallback
  const { pathname } = url;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect("/sign-in");
});
