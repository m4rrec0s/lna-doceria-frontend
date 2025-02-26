import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Obtém o token do cookie
  const token = request.cookies.get("token")?.value || "";

  // Verifica se o usuário está acessando a rota protegida
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    // Se não houver token, redireciona para a página de login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Adiciona verificação para página de login com autenticação existente
  if (request.nextUrl.pathname === "/login") {
    // Se já tiver token, redireciona para o dashboard
    if (token) {
      const dashboardUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
