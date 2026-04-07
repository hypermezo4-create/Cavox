"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminGetOrders, adminUpdateOrderStatus, type AdminOrder } from "@/lib/admin-api";

const orderStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentStatuses = ["PENDING", "AWAITING_REVIEW", "PAID", "FAILED", "REFUNDED"];

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminGetOrders(token)
      .then(setOrders)
      .catch((err: any) => setError(err?.message || "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [token]);

  async function updateOrder(orderId: string, payload: Record<string, unknown>) {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminUpdateOrderStatus(orderId, payload, token);
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...updated } : order));
      setSuccess(`Order #${updated.orderNumber} updated.`);
    } catch (err: any) {
      setError(err?.message || "Failed to update order");
    }
  }

  return (
    <AdminPageShell title="Orders" subtitle="Track fulfilment, payment review, and customer delivery progress.">
      <StatusMessage error={error} success={success} />
      <div className="space-y-4">
        {loading ? <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/70">Loading orders...</div> : orders.map((order) => (
          <div key={order.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">#{order.orderNumber}</h2>
                    <p className="text-sm text-white/60">{order.customerName} • {order.customerEmail} • {order.customerPhone}</p>
                  </div>
                  <div className="text-right text-sm text-white/70">
                    <p>EGP {Number(order.totalPrice).toFixed(2)}</p>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
                  <p>{order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ""}</p>
                  <p>{order.city}, {order.governorate}, {order.country}</p>
                  {order.notes ? <p className="mt-2 text-white/60">Notes: {order.notes}</p> : null}
                  {order.paymentReference ? <p className="mt-2 text-white/60">Payment ref: {order.paymentReference}</p> : null}
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80">
                      <div>
                        <p className="font-medium text-white">{item.productNameEn}</p>
                        <p className="text-xs text-white/55">{item.variantSize || "—"} / {item.variantColor || "—"} • Qty {item.quantity}</p>
                      </div>
                      <p>EGP {Number(item.lineTotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <label className="space-y-2 text-sm text-white/80">Order status<select value={order.orderStatus} onChange={(e) => updateOrder(order.id, { orderStatus: e.target.value, paymentStatus: order.paymentStatus })} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <label className="space-y-2 text-sm text-white/80">Payment status<select value={order.paymentStatus} onChange={(e) => updateOrder(order.id, { paymentStatus: e.target.value, orderStatus: order.orderStatus })} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white">{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                  <p>Subtotal: EGP {Number(order.subtotal).toFixed(2)}</p>
                  <p>Shipping: EGP {Number(order.shippingFee).toFixed(2)}</p>
                  <p>Discount: EGP {Number(order.discountAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && !orders.length ? <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/55">No orders yet.</div> : null}
      </div>
    </AdminPageShell>
  );
}
