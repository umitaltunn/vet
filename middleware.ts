import { NextResponse, type NextRequest } from "next/server";

/**
 * Cok kiracili yonlendirme.
 * - Platform adresleri (localhost, PLATFORM_HOSTS) normal calisir: /, /panel, /admin, /k/slug
 * - patidostu.localhost:3000 gibi alt alan adlari ya da klinigin kendi alan adi
 *   (patidostu.com) gelirse istek gorunmeden /k/<anahtar>/... sayfasina yonlendirilir.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const platform = (process.env.PLATFORM_HOSTS ?? "localhost,127.0.0.1").split(",").map((s) => s.trim().toLowerCase());
  if (!host || platform.includes(host)) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/panel") || pathname.startsWith("/admin") || pathname.startsWith("/giris") || pathname.startsWith("/k/")) {
    return NextResponse.next();
  }

  const root = (process.env.ROOT_DOMAIN ?? "localhost").toLowerCase();
  const key = host.endsWith(`.${root}`) ? host.slice(0, -(root.length + 1)) : host;

  const url = req.nextUrl.clone();
  url.pathname = `/k/${encodeURIComponent(key)}${pathname === "/" ? "" : pathname}`;
  const headers = new Headers(req.headers);
  headers.set("x-site-mode", "host");
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|api/|demo/|favicon.ico|robots.txt).*)"],
};
