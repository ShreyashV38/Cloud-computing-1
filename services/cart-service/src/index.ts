import express from "express";
import cors from "cors";
import cartRouter from "./routes/cart";

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Cart Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/cart", cartRouter);

app.get("/health", (req, res) => {
  res.json({ service: "cart-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`Cart Service listening on port ${port}`);
});
