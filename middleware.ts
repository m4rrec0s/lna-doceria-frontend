import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const url = request.nextUrl.clone();
  const loginUrl = new URL("/login", request.url);
  const dashboardUrl = new URL("/dashboard", request.url);

  if (url.pathname.startsWith("/login")) {
    if (token) {
      console.log(
        "Usuário autenticado tentando acessar login, redirecionando para dashboard"
      );
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log(
        "Acesso não autorizado ao dashboard, redirecionando para login"
      );
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (url.pathname === "/" && token) {
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login"],
};
