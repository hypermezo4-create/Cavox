import type { ReactNode } from "react";
import AdminSidebar from "../../components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060a] text-white md:flex">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
