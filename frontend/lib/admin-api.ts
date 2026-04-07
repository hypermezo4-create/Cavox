"use client";

import { apiFetch, type Category, type Order, type Product } from "./api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  createdAt: string;
  _count?: {
    orders?: number;
    cartItems?: number;
    reviews?: number;
    addresses?: number;
  };
}

export interface CategoryWithMeta extends Category {
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  showOnHome?: boolean;
  parentId?: string | null;
  parent?: { id: string; nameEn: string; nameAr: string; slug: string } | null;
  _count?: { products: number; children: number };
}

export interface SiteSettingItem {
  key: string;
  value: string;
  label?: string | null;
  group?: string | null;
}

export interface SocialLinkItem {
  id: string;
  platform: string;
  label?: string | null;
  url: string;
  icon?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  topic: string;
  subject: string;
  message: string;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
}

export interface BannerItem {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
  categoryId?: string | null;
  productId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
}

export type AdminProduct = Product;
export type AdminOrder = Order & {
  user?: { id: string; name: string; email: string; phone?: string | null };
};

export async function uploadImageFile(file: File, token: string) {
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const uploaded = await apiFetch<{ url: string }>(
    "/upload",
    {
      method: "POST",
      body: JSON.stringify({ fileName: file.name, dataBase64 })
    },
    token
  );

  return uploaded.url;
}

export const adminGetProducts = (token: string) =>
  apiFetch<{ items: AdminProduct[]; pagination: { total: number; page: number; pages: number; limit: number } }>(
    "/products?includeInactive=true&limit=100",
    {},
    token
  );

export const adminGetProduct = (id: string, token: string) => apiFetch<AdminProduct>(`/products/admin/${id}`, {}, token);
export const adminSaveProduct = (payload: Record<string, unknown>, token: string, id?: string) =>
  apiFetch<AdminProduct>(`/products${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  }, token);
export const adminDeleteProduct = (id: string, token: string) =>
  apiFetch<void>(`/products/${id}`, { method: "DELETE" }, token);

export const adminGetOrders = (token: string) => apiFetch<AdminOrder[]>("/orders", {}, token);
export const adminUpdateOrderStatus = (
  id: string,
  payload: Record<string, unknown>,
  token: string
) => apiFetch<AdminOrder>(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }, token);

export const adminGetUsers = (token: string) => apiFetch<AdminUser[]>("/users", {}, token);
export const adminUpdateUserRole = (id: string, role: string, token: string) =>
  apiFetch<AdminUser>(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token);

export const adminGetCategories = (token: string) =>
  apiFetch<CategoryWithMeta[]>("/categories?includeInactive=true", {}, token);
export const adminSaveCategory = (payload: Record<string, unknown>, token: string, id?: string) =>
  apiFetch<CategoryWithMeta>(`/categories${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  }, token);
export const adminDeleteCategory = (id: string, token: string) =>
  apiFetch<void>(`/categories/${id}`, { method: "DELETE" }, token);

export const adminGetSettings = (token: string) => apiFetch<{ items: SiteSettingItem[]; map: Record<string, string> }>("/settings", {}, token);
export const adminSaveSettings = (items: SiteSettingItem[], token: string) =>
  apiFetch<SiteSettingItem[]>("/settings", { method: "PUT", body: JSON.stringify({ items }) }, token);

export const adminGetSocial = (token: string) => apiFetch<SocialLinkItem[]>("/social?includeInactive=true", {}, token);
export const adminSaveSocial = (payload: Record<string, unknown>, token: string, id?: string) =>
  apiFetch<SocialLinkItem>(`/social${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  }, token);
export const adminDeleteSocial = (id: string, token: string) => apiFetch<void>(`/social/${id}`, { method: "DELETE" }, token);

export const adminGetContacts = (token: string) => apiFetch<ContactSubmission[]>("/contact", {}, token);
export const adminUpdateContact = (id: string, payload: Record<string, unknown>, token: string) =>
  apiFetch<ContactSubmission>(`/contact/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);

export const adminGetBanners = (token: string) => apiFetch<BannerItem[]>("/banners?includeInactive=true", {}, token);
export const adminSaveBanner = (payload: Record<string, unknown>, token: string, id?: string) =>
  apiFetch<BannerItem>(`/banners${id ? `/${id}` : ""}`, {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(payload)
  }, token);
export const adminDeleteBanner = (id: string, token: string) => apiFetch<void>(`/banners/${id}`, { method: "DELETE" }, token);
