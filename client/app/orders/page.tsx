"use client";

import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:4000/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "shipped": return <Truck className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "var(--success)";
      case "shipped": return "var(--accent-link)";
      default: return "var(--warning)";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-pulse">
        <div className="w-12 h-12 rounded-full mb-4 border-t-2 border-r-2" style={{ borderColor: "var(--accent-primary)" }}></div>
        <p style={{ color: "var(--text-muted)" }}>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center animate-fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "var(--bg-muted)", border: "1px solid var(--border)" }}
        >
          <Package className="w-8 h-8" style={{ color: "var(--text-muted)" }} />
        </div>
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)" }}
        >
          No orders yet
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          When you place an order, it will appear here.
        </p>
        <Link href="/" className="btn-primary mt-4 cursor-pointer" style={{ textDecoration: "none" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "2rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "2rem",
        }}
      >
        Your Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order, idx) => (
          <div
            key={order.id}
            className="card animate-fade-in-up overflow-hidden"
            style={{ animationDelay: `${idx * 0.08}s` }}
          >
            {/* Order Header */}
            <div
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ background: "var(--bg-muted)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p style={{ color: "var(--text-secondary)" }}>Order Placed</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--text-secondary)" }}>Total</p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                {getStatusIcon(order.status)}
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: getStatusColor(order.status) }}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-4 divide-y" style={{ borderColor: "var(--border)" }}>
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div
                    className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {item.product.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
