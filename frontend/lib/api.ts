export const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  image?: string | null;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku?: string | null;
  stock: number;
  priceOverride?: number | string | null;
  image?: string | null;
  isActive: boolean;
}

export interface ProductReview {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescriptionEn?: string | null;
  shortDescriptionAr?: string | null;
  brand: string;
  price: number | string;
  salePrice?: number | string | null;
  currency?: string;
  featuredImage?: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isOnSale?: boolean;
  category?: Category;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  _count?: { reviews: number };
}

export interface ProductsResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  selectedSize?: string | null;
  selectedColor?: string | null;
  quantity: number;
  product: Product;
  variant?: ProductVariant | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productNameEn: string;
  productNameAr: string;
  productSlug: string;
  variantSize?: string | null;
  variantColor?: string | null;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number | string;
  shippingFee: number | string;
  discountAmount: number | string;
  totalPrice: number | string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  governorate: string;
  country: string;
  postalCode?: string | null;
  notes?: string | null;
  paymentReference?: string | null;
  paymentReceiptUrl?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface SettingsResponse {
  items: Array<{ key: string; value: string; label?: string | null; group?: string | null }>;
  map: Record<string, string>;
}

function normalizeHeaders(initHeaders?: HeadersInit, includeJson = true) {
  const headers = new Headers(initHeaders || {});
  if (includeJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers = normalizeHeaders(init.headers, !isFormData);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBase}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body && "message" in body ? String(body.message) : `API error: ${response.status}`;
    throw new ApiError(response.status, message, body);
  }

  return body as T;
}

export const getProducts = (query = "") => apiFetch<ProductsResponse>(`/products${query ? `?${query}` : ""}`);
export const getProductById = (id: string) => apiFetch<Product>(`/products/${id}`);
export const getProductBySlug = (slug: string) => apiFetch<Product>(`/products/slug/${slug}`);
export const getCategories = () => apiFetch<Category[]>("/categories");
export const getSettings = () => apiFetch<SettingsResponse>("/settings");
