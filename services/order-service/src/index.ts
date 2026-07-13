import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders";

const app = express();
const port = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Order Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/orders", ordersRouter);

app.get("/health", (req, res) => {
  res.json({ service: "order-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`Order Service listening on port ${port}`);
});
