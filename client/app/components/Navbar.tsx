"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { cartCount } = useCart();
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (query) {
      router.push(`/?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(250, 250, 249, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
        style={{ maxWidth: "1200px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          style={{ textDecoration: "none", color: "var(--text-primary)" }}
          onClick={() => setSearchValue("")}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.35rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
            }}
          >
            MinimalStore
          </span>
        </Link>

        {/* Inline Search Bar */}
        <form onSubmit={handleSearch} className="search-bar hidden sm:flex">
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search products..."
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                router.push("/");
              }}
              className="text-xs shrink-0 px-2 py-1 rounded transition-colors cursor-pointer"
              style={{ color: "var(--text-muted)" }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="sm:hidden flex items-center">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="w-28 px-3 py-2 text-xs rounded-full"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </form>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-muted)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-surface)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <ShoppingCart className="w-[18px] h-[18px]" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--accent-cta)" }}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            className="hidden sm:flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-muted)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-surface)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Orders
          </Link>
        </div>
      </div>
    </header>
  );
}
