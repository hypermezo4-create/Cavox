import "../styles/globals.css";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

export const metadata = {
  title: "Cavo | Premium Footwear",
  description: "Cavo premium footwear storefront with admin dashboard, multilingual support, and customer chat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}