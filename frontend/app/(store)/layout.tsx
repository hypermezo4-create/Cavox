import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Starfield from "@/components/effects/Starfield";
import ChatWidget from "@/components/chat/ChatWidget";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <Starfield />
      <div className="relative min-h-screen bg-mesh">
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-220px)] max-w-7xl px-4 pb-10 pt-6 md:px-6">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </AuthSessionProvider>
  );
}