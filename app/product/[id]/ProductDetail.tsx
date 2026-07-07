"use client";

import { useCart } from "../../context/CartContext";
import { Star, ShoppingCart, Zap, ArrowLeft, Package, Shield, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGrid from "../../components/ProductGrid";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: { id: string; name: string; slug: string };
  reviews: Review[];
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: { name: string; slug: string };
}

export default function ProductDetail({
  product,
  relatedProducts,
}: {
  product: ProductData;
  relatedProducts: RelatedProduct[];
}) {
  const { addToCart, buyNow } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    buyNow({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    router.push("/payment");
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
        style={{ color: "var(--text-muted)", textDecoration: "none", marginBottom: "2rem", display: "inline-flex" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14" style={{ marginTop: "1rem" }}>
        {/* Image */}
        <div
          className="card overflow-hidden aspect-square animate-fade-in-up"
          style={{ cursor: "default", borderRadius: "var(--radius-lg)" }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="animate-fade-in-up animation-delay-200" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <span className="badge badge-accent" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
              {product.category.name}
            </span>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "2rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.rating) ? "star-filled fill-current" : "star-empty"}`}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>

          {/* Price */}
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            ₹{product.price.toLocaleString("en-IN")}
            <span className="text-sm font-normal ml-2" style={{ color: "var(--text-muted)" }}>
              Inclusive of all taxes
            </span>
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {product.description}
            </p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--success)" }}>
                  In Stock ({product.stock} available)
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--danger)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--danger)" }}>
                  Out of Stock
                </span>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                })
              }
              className="btn-primary flex-1 !py-3.5 !rounded-lg"
              disabled={product.stock === 0}
              style={{ fontSize: "0.95rem" }}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="btn-buy-now flex-1 !py-3.5 !rounded-lg"
              disabled={product.stock === 0}
              style={{ fontSize: "0.95rem" }}
            >
              <Zap className="w-5 h-5" />
              Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: "Free Delivery" },
              { icon: Shield, label: "Secure Payment" },
              { icon: Package, label: "Easy Returns" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="card p-3 flex flex-col items-center gap-2 text-center"
                style={{ cursor: "default" }}
              >
                <Icon className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section style={{ marginTop: "4rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="grid gap-3">
            {product.reviews.map((review, idx) => (
              <div
                key={review.id}
                className="card p-5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.08}s`, cursor: "default" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "var(--accent-primary)" }}
                    >
                      {review.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {review.user.name}
                      </p>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= review.rating ? "star-filled fill-current" : "star-empty"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: "4rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            You May Also Like
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
