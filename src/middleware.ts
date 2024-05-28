import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") ?? [];

export default function middleware(request: NextRequest) {
  console.log("Origin", request.headers.get("origin"));

  const origin: string | null = request.headers.get("origin");
  const res = NextResponse.next();
  if ((origin !== null) && ALLOWED_ORIGINS.includes(origin)) {
    // add the CORS headers to the response
    res.headers.append("Access-Control-Allow-Credentials", "true");
    res.headers.append("Access-Control-Allow-Origin", origin);
    // res.headers.append('Access-Control-Allow-Origin', origin)
    res.headers.append(
      "Access-Control-Allow-Methods",
      "GET,DELETE,PATCH,POST,PUT",
    );
    res.headers.append(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    );
  }

  return res;
}
export const config = {
  matcher: ["/api/ext/:path*"],
};
