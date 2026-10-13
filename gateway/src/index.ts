import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 4000;

// ─── Service URLs (env vars for Docker, fallback to localhost) ───
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://127.0.0.1:4001";
const SEARCH_SERVICE  = process.env.SEARCH_SERVICE_URL  || "http://127.0.0.1:4002";
const CART_SERVICE     = process.env.CART_SERVICE_URL     || "http://127.0.0.1:4003";
const ORDER_SERVICE    = process.env.ORDER_SERVICE_URL    || "http://127.0.0.1:4004";
const PAYMENT_SERVICE  = process.env.PAYMENT_SERVICE_URL  || "http://127.0.0.1:4005";
const REVIEW_SERVICE   = process.env.REVIEW_SERVICE_URL   || "http://127.0.0.1:4006";
const USER_SERVICE     = process.env.USER_SERVICE_URL     || "http://127.0.0.1:4008";
const CORS_ORIGIN      = process.env.CORS_ORIGIN          || "http://localhost:3000";

app.use(cors({ origin: CORS_ORIGIN }));

// ─── Reverse Proxy for Microservices ─────────────────────
app.use(createProxyMiddleware({
  changeOrigin: true,
  router: (req) => {
    const path = req.url || "";
    if (path.startsWith("/api/products") || path.startsWith("/api/categories")) return PRODUCT_SERVICE;
    if (path.startsWith("/api/search"))   return SEARCH_SERVICE;
    if (path.startsWith("/api/cart"))      return CART_SERVICE;
    if (path.startsWith("/api/orders"))    return ORDER_SERVICE;
    if (path.startsWith("/api/payments"))  return PAYMENT_SERVICE;
    if (path.startsWith("/api/reviews"))   return REVIEW_SERVICE;
    if (path.startsWith("/api/users"))     return USER_SERVICE;
    return undefined; // Let it fall through to other middleware (e.g. health check)
  }
}));

// ─── Gateway Health Check ───────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "Gateway is running",
    services: {
      "product-service": PRODUCT_SERVICE,
      "search-service": SEARCH_SERVICE,
      "cart-service": CART_SERVICE,
      "order-service": ORDER_SERVICE,
      "payment-service": PAYMENT_SERVICE,
      "review-service": REVIEW_SERVICE,
      "user-service": USER_SERVICE,
    },
  });
});

app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
  console.log(`Routing to 6 microservices + user-service`);
});
