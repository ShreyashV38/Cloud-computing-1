"use client";

import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Lock, Smartphone, MapPin } from "lucide-react";

const API_BASE = "http://127.0.0.1:4000";

export default function PaymentPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError("");

    const formData = new FormData(e.currentTarget);
    const shippingAddress = `${formData.get("fname")} ${formData.get("lname")}, ${formData.get("address")}, ${formData.get("city")}, ${formData.get("state")} - ${formData.get("pincode")}`;

    try {
      // Step 1: Process payment via payment-service
      const paymentRes = await fetch(`${API_BASE}/api/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartTotal,
          method: paymentMethod,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok || !paymentData.success) {
        setPaymentError(paymentData.message || "Payment failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Create order via order-service (which also triggers notification-service)
      const orderRes = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          shippingAddress,
          total: cartTotal,
        }),
      });

      if (!orderRes.ok) throw new Error("Order failed");

      // Step 3: Clear cart and show success
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();

      setTimeout(() => {
        router.push("/orders");
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      setIsSubmitting(false);
      setPaymentError("Something went wrong. Please try again.");
    }
  };

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <h2
          className="text-2xl mb-2"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)" }}
        >
          No items to checkout
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Return to the shop to add some items.
        </p>
        <button onClick={() => router.push("/")} className="btn-primary cursor-pointer">
          Back to Shop
        </button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "#DCFCE7", border: "2px solid var(--success)" }}
        >
          <CheckCircle2 className="w-10 h-10" style={{ color: "var(--success)" }} />
        </div>
        <h2
          className="text-3xl mb-2"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)" }}
        >
          Order Confirmed!
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--accent-cta)", fontWeight: 500 }}>
          Payment processed &amp; confirmation email sent
        </p>
        <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
          Thank you for your purchase! Your order has been placed and is being processed. Redirecting to orders...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Checkout
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            Total: <span className="font-bold" style={{ color: "var(--text-primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
          </p>

          {paymentError && (
            <div
              className="mb-6 p-4 rounded-lg animate-fade-in"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#DC2626",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              ⚠️ {paymentError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
            {/* Shipping Address */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <MapPin className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fname" className="input-label">First Name</label>
                    <input type="text" id="fname" name="fname" required className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="lname" className="input-label">Last Name</label>
                    <input type="text" id="lname" name="lname" required className="input-field" />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="input-label">Address</label>
                  <input type="text" id="address" name="address" required className="input-field" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="input-label">Pincode</label>
                    <input type="text" id="pincode" name="pincode" required pattern="[0-9]{6}" maxLength={6} placeholder="400001" className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="city" className="input-label">City</label>
                    <input type="text" id="city" name="city" required className="input-field" />
                  </div>
                </div>
                <div>
                  <label htmlFor="state" className="input-label">State</label>
                  <select id="state" name="state" required className="input-field">
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                <Lock className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3 mb-6">
                <label
                  className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    background: paymentMethod === "upi" ? "#FFF7ED" : "var(--bg-muted)",
                    border: `1px solid ${paymentMethod === "upi" ? "var(--accent-cta)" : "var(--border)"}`,
                  }}
                >
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="w-4 h-4 accent-orange-600" />
                  <Smartphone className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>UPI (GPay, PhonePe, Paytm)</span>
                </label>

                <label
                  className="flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-200"
                  style={{
                    background: paymentMethod === "card" ? "#FFF7ED" : "var(--bg-muted)",
                    border: `1px solid ${paymentMethod === "card" ? "var(--accent-cta)" : "var(--border)"}`,
                  }}
                >
                  <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="w-4 h-4 accent-orange-600" />
                  <CreditCard className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>Credit / Debit Card</span>
                </label>
              </div>

              {paymentMethod === "upi" && (
                <div className="p-4 rounded-lg animate-fade-in" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}>
                  <label htmlFor="upiId" className="input-label">Enter your UPI ID</label>
                  <input type="text" id="upiId" required={paymentMethod === "upi"} placeholder="9876543210@ybl" className="input-field" />
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>A payment request will be sent to your UPI app.</p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-4 p-4 rounded-lg animate-fade-in" style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}>
                  <div>
                    <label htmlFor="cardName" className="input-label">Name on Card</label>
                    <input type="text" id="cardName" required={paymentMethod === "card"} className="input-field" />
                  </div>
                  <div>
                    <label htmlFor="cardNumber" className="input-label">Card Number</label>
                    <input type="text" id="cardNumber" required={paymentMethod === "card"} pattern="\d{16}" maxLength={16} className="input-field" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry" className="input-label">Expiry</label>
                      <input type="text" id="expiry" required={paymentMethod === "card"} placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\/?([0-9]{2})" maxLength={5} className="input-field" />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="input-label">CVV</label>
                      <input type="text" id="cvv" required={paymentMethod === "card"} pattern="\d{3,4}" maxLength={4} className="input-field" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="card p-5 sticky top-24" style={{ cursor: "default" }}>
            <h2 className="text-base font-semibold pb-4" style={{ color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
              Order Summary
            </h2>

            <ul className="space-y-2 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    {item.name} <span style={{ color: "var(--text-muted)" }}>x{item.quantity}</span>
                  </span>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center text-sm mt-3">
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span style={{ color: "var(--text-primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between items-center text-sm mt-2">
              <span style={{ color: "var(--text-secondary)" }}>Delivery</span>
              <span className="font-medium" style={{ color: "var(--success)" }}>Free</span>
            </div>

            <div className="pt-3 mt-3 flex justify-between items-center text-lg font-bold" style={{ borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-primary)" }}>Total</span>
              <span style={{ color: "var(--text-primary)" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="btn-buy-now w-full !py-3 disabled:opacity-70 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {isSubmitting ? "Processing..." : `Pay ₹${cartTotal.toLocaleString("en-IN")}`}
              </button>
            </div>

            <p className="text-xs text-center flex items-center justify-center gap-1 mt-3" style={{ color: "var(--text-muted)" }}>
              <Lock className="w-3 h-3" />
              100% Secure Checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
