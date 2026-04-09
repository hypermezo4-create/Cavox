import type { Metadata } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Cavo",
  description: "Devices / ROMs / Team / Notifications + Download Tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
        <Nav />
        <main style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
