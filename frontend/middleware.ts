import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
      if (isAdminPath) return token?.role === "ADMIN";
      if (req.nextUrl.pathname.startsWith("/checkout")) return !!token;
      return true;
    }
  }
});

export const config = {
  matcher: ["/admin/:path*", "/checkout"]
};
