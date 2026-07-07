"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        marginTop: "4rem",
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 py-10"
        style={{ maxWidth: "1200px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginBottom: "0.5rem",
              }}
            >
              MinimalStore
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Authentic Indian products, curated with care.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Shop
            </h4>
            <ul className="space-y-1.5">
              {["Clothing", "Food & Spices", "Electronics", "Home & Decor", "Beauty"].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-xs transition-colors cursor-pointer"
                    style={{ color: "var(--text-muted)", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Help
            </h4>
            <ul className="space-y-1.5">
              {["Order Tracking", "Returns & Refunds", "Shipping Info", "Contact Us"].map((item) => (
                <li key={item}>
                  <span className="text-xs cursor-default" style={{ color: "var(--text-muted)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            2026 MinimalStore India. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms"].map((item) => (
              <span key={item} className="text-xs cursor-default" style={{ color: "var(--text-muted)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
