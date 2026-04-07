import "../styles/globals.css";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Starfield from "@/components/effects/Starfield";
import ChatWidget from "@/components/chat/ChatWidget";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

export const metadata = {
  title: "Cavo | Premium Footwear",
  description: "Cavo premium footwear storefront with admin dashboard, multilingual support, and customer chat.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        <AuthSessionProvider>
          <Starfield />
          <div className="relative min-h-screen bg-mesh">
            <Navbar />
            <main className="mx-auto min-h-[calc(100vh-220px)] max-w-7xl px-4 pb-10 pt-6 md:px-6">{children}</main>
            <Footer />
            <ChatWidget />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
