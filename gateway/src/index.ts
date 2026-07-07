import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));

// Route to Product Service (Port 4001)
app.use("/api/products", createProxyMiddleware({ target: "http://127.0.0.1:4001", changeOrigin: true }));
app.use("/api/categories", createProxyMiddleware({ target: "http://127.0.0.1:4001", changeOrigin: true }));

// Route to Order Service (Port 4002)
app.use("/api/orders", createProxyMiddleware({ target: "http://127.0.0.1:4002", changeOrigin: true }));

// Route to User Service (Port 4003)
app.use("/api/reviews", createProxyMiddleware({ target: "http://127.0.0.1:4003", changeOrigin: true }));
app.use("/api/users", createProxyMiddleware({ target: "http://127.0.0.1:4003", changeOrigin: true }));

app.get("/health", (req, res) => {
  res.json({ status: "Gateway is running", services: { product: 4001, order: 4002, user: 4003 } });
});

app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
