import ProductDetail from "./ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(`http://localhost:4000/api/products/${id}`, {
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
