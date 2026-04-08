import "../styles/globals.css";

export const metadata = {
  title: "Cavo | Premium Footwear",
  description: "Cavo premium footwear storefront with admin dashboard and multilingual support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}