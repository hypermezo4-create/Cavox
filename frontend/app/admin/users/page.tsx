"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { StatusMessage } from "@/components/admin/StatusMessage";
import { adminGetUsers, adminUpdateUserRole, type AdminUser } from "@/lib/admin-api";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    adminGetUsers(token)
      .then(setUsers)
      .catch((err: any) => setError(err?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, [token]);

  async function changeRole(userId: string, role: string) {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminUpdateUserRole(userId, role, token);
      setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: updated.role } : user));
      setSuccess(`${updated.name}'s role updated to ${updated.role}.`);
    } catch (err: any) {
      setError(err?.message || "Failed to update user role");
    }
  }

  return (
    <AdminPageShell title="Users" subtitle="Manage customer accounts and admin permissions.">
      <StatusMessage error={error} success={success} />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-2 md:p-4">
        {loading ? <div className="p-6 text-white/70">Loading users...</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/80">
              <thead className="text-xs uppercase tracking-wide text-white/45">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Cart items</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-white/10">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-white/55">{user.email}</p>
                      {user.phone ? <p className="text-xs text-white/55">{user.phone}</p> : null}
                    </td>
                    <td className="px-4 py-4">{user._count?.orders || 0}</td>
                    <td className="px-4 py-4">{user._count?.cartItems || 0}</td>
                    <td className="px-4 py-4">
                      <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value)} className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-white">
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
