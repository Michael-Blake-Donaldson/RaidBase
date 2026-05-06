import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    return;
  },
  {
    pages: {
      signIn: "/auth/sign-in",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        const role = token?.role;

        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return role === "ADMIN" || role === "MODERATOR";
        }

        if (pathname.startsWith("/settings")) {
          return Boolean(token?.sub);
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/settings/:path*", "/api/admin/:path*"],
};