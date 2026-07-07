"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section
      className="animate-fade-in-up"
      style={{ padding: "3rem 0 2rem" }}
    >
      <div style={{ maxWidth: "640px" }}>
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)", marginBottom: "1rem", fontFamily: "var(--font-body)" }}
        >
          Premium Tech Store
        </p>

        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "1.25rem",
          }}
        >
          The Latest Tech,
          <br />
          Delivered to You
        </h1>

        <p
          className="text-base leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2rem",
            maxWidth: "480px",
          }}
        >
          From premium headphones to powerful laptops — discover top-rated
          tech products at the best prices.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="#products" className="btn-primary" style={{ textDecoration: "none" }}>
            Shop Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/orders" className="btn-secondary" style={{ textDecoration: "none" }}>
            View Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
