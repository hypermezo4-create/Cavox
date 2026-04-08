import ProductDetailsClient from "@/components/store/ProductDetailsClient";
import { Product, ProductReview, apiFetch } from "@/lib/api";

export default async function ProductDetails({ params }: { params: { id: string } }) {
  const [product, reviews] = await Promise.all([
    apiFetch<Product>(`/products/${params.id}`),
    apiFetch<ProductReview[]>(`/reviews/product/${params.id}`).catch(() => [])
  ]);

  return <ProductDetailsClient product={product} initialReviews={reviews} />;
}
