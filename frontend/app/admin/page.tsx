"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import {
  adminGetCategories,
  adminGetContacts,
  adminGetOrders,
  adminGetProducts,
  adminGetUsers,
  type AdminOrder,
  type AdminProduct,
  type AdminUser,
  type CategoryWithMeta,
  type ContactSubmission,
} from "@/lib/admin-api";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([
      adminGetProducts(token),
      adminGetOrders(token),
      adminGetUsers(token),
      adminGetCategories(token),
      adminGetContacts(token)
    ])
      .then(([productRes, orderRes, userRes, categoryRes, contactRes]) => {
        if (cancelled) return;
        setProducts(productRes.items);
        setOrders(orderRes);
        setUsers(userRes);
        setCategories(categoryRes);
        setContacts(contactRes);
      })
      .catch((err: any) => !cancelled && setError(err?.message || "Failed to load dashboard"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0), [orders]);
  const pendingOrders = orders.filter((order) => order.orderStatus === "PENDING").length;
  const awaitingReview = orders.filter((order) => order.paymentStatus === "AWAITING_REVIEW").length;
  const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 5).slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const recentContacts = contacts.slice(0, 5);

  return (
    <AdminPageShell title="Dashboard" subtitle="Monitor sales, stock, customers, and incoming messages from one place.">
      <StatusMessage error={error} />
      {loading ? <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">Loading dashboard...</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Revenue", `EGP ${revenue.toFixed(2)}`],
          ["Orders", String(orders.length)],
          ["Pending orders", String(pendingOrders)],
          ["Awaiting review", String(awaitingReview)],
          ["Users", String(users.length)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg">
            <p className="text-sm text-white/55">{label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm text-white/65 hover:text-white">View all</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.length ? recentOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-white/55">{order.customerName} • {order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">EGP {Number(order.totalPrice).toFixed(2)}</p>
                      <p className="text-xs text-white/60">{order.orderStatus} / {order.paymentStatus}</p>
                    </div>
                  </div>
                </div>
              )) : <p className="text-sm text-white/55">No orders yet.</p>}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Low stock alerts</h2>
              <Link href="/admin/products" className="text-sm text-white/65 hover:text-white">Manage products</Link>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length ? lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="font-semibold text-white">{product.nameEn}</p>
                    <p className="text-sm text-white/55">{product.brand} • {product.category?.nameEn || "Uncategorized"}</p>
                  </div>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">{Number(product.stock || 0)} left</span>
                </div>
              )) : <p className="text-sm text-white/55">Stock levels look good.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Store summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-white/75">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><span>Products</span><span>{products.length}</span></div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><span>Active categories</span><span>{categories.filter((item) => item.isActive).length}</span></div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><span>Featured products</span><span>{products.filter((item) => item.isFeatured).length}</span></div>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><span>Unread contacts</span><span>{contacts.filter((item) => item.status === "NEW").length}</span></div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Latest messages</h2>
              <Link href="/admin/contact" className="text-sm text-white/65 hover:text-white">Inbox</Link>
            </div>
            <div className="space-y-3">
              {recentContacts.length ? recentContacts.map((submission) => (
                <div key={submission.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{submission.subject}</p>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-white/65">{submission.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/55">{submission.name} • {submission.email}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-white/70">{submission.message}</p>
                </div>
              )) : <p className="text-sm text-white/55">No messages yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
