import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";

const API_URL = process.env.API_URL || "http://127.0.0.1:4000";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`${API_URL}/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const data = await res.json();

  return (
    <ProductDetail
      product={data.product}
      relatedProducts={data.relatedProducts}
    />
  );
}
