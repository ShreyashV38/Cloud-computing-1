import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));

// ─── Reverse Proxy for Microservices ─────────────────────
app.use(createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    const path = req.url || "";
    if (path.startsWith("/api/products") || path.startsWith("/api/categories")) return "http://127.0.0.1:4001";
    if (path.startsWith("/api/search")) return "http://127.0.0.1:4002";
    if (path.startsWith("/api/cart")) return "http://127.0.0.1:4003";
    if (path.startsWith("/api/orders")) return "http://127.0.0.1:4004";
    if (path.startsWith("/api/payments")) return "http://127.0.0.1:4005";
    if (path.startsWith("/api/reviews")) return "http://127.0.0.1:4006";
    if (path.startsWith("/api/users")) return "http://127.0.0.1:4008";
    return undefined; // Let it fall through to other middleware (e.g. health check)
  }
}));

// ─── Gateway Health Check ───────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "Gateway is running",
    services: {
      "product-service": 4001,
      "search-service": 4002,
      "cart-service": 4003,
      "order-service": 4004,
      "payment-service": 4005,
      "review-service": 4006,
      "user-service": 4008,
    },
  });
});

app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
  console.log(`Routing to 6 microservices + user-service`);
});
