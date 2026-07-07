"use client";

import { useCart } from "../context/CartContext";
import Link from "next/link";
import { Trash2, ArrowRight, Plus, Minus, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, addToCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center animate-fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
        >
          <ShoppingCart className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
        </div>
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)" }}
        >
          Your cart is empty
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/" className="btn-primary mt-4 cursor-pointer" style={{ textDecoration: "none" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "2rem",
        }}
      >
        Shopping Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-3">
          {cartItems.map((item, idx) => (
            <div
              key={item.id}
              className="card p-4 flex gap-4 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s`, cursor: "default" }}
            >
              <div
                className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                style={{ border: "1px solid var(--border)" }}
              >
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                    {item.name}
                  </h3>
                  <span className="font-bold text-sm shrink-0" style={{ color: "var(--text-primary)" }}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div
                    className="flex items-center gap-0 rounded-md"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className="w-8 text-center text-sm font-medium"
                      style={{ color: "var(--text-primary)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                      className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card p-5 sticky top-24" style={{ cursor: "default" }}>
            <h2
              className="text-base font-semibold pb-4"
              style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}
            >
              Order Summary
            </h2>

            <div className="flex justify-between items-center text-sm mt-4">
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ color: "var(--text-primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center text-sm mt-2">
              <span style={{ color: "var(--text-secondary)" }}>Delivery</span>
              <span className="font-medium" style={{ color: "var(--success)" }}>Free</span>
            </div>

            <div
              className="pt-4 mt-4 flex justify-between items-center text-lg font-bold"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span style={{ color: "var(--text-primary)" }}>Total</span>
              <span style={{ color: "var(--text-primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <p className="text-xs text-center py-2 mt-2" style={{ color: "var(--text-muted)" }}>
              Includes all taxes
            </p>

            <Link
              href="/payment"
              className="btn-primary w-full mt-2 !py-3 cursor-pointer"
              style={{ textDecoration: "none" }}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
