"use client";

import { useCart } from "../context/CartContext";
import { ShoppingCart, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: {
    name: string;
    slug: string;
  };
}

export default function ProductGrid({ products }: { products: ProductData[] }) {
  const { addToCart, buyNow } = useCart();
  const router = useRouter();

  const handleBuyNow = (product: ProductData) => {
    buyNow({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    router.push("/payment");
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="card group flex flex-col overflow-hidden animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index, 12) * 0.05}s` }}
        >
          {/* Image */}
          <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden cursor-pointer">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Stock indicator */}
            {product.stock < 30 && (
              <div className="absolute top-2 right-2">
                <span className="badge text-white" style={{ background: "var(--danger)", fontSize: "0.6rem" }}>
                  Only {product.stock} left
                </span>
              </div>
            )}
          </Link>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 gap-2">
            <Link href={`/product/${product.id}`} className="flex-1 cursor-pointer" style={{ textDecoration: "none" }}>
              {/* Category */}
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
                {product.category.name}
              </p>
              <h3
                className="font-medium text-sm leading-snug"
                style={{
                  color: "var(--text-primary)",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-1 mt-1">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= Math.round(product.rating) ? "star-filled fill-current" : "star-empty"}`}
                    />
                  ))}
                </div>
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  ({product.reviewCount})
                </span>
              </div>
            </Link>

            {/* Price */}
            <p
              className="text-base font-bold"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={() =>
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer text-white"
                style={{ background: "var(--accent-primary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#292524"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-primary)"; }}
              >
                <ShoppingCart className="w-3 h-3" />
                Cart
              </button>
              <button
                onClick={() => handleBuyNow(product)}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded text-[11px] font-semibold transition-all duration-200 cursor-pointer text-white"
                style={{ background: "var(--accent-cta)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-cta-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-cta)"; }}
              >
                <Zap className="w-3 h-3" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
