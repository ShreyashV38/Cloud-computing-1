import express from "express";
import cors from "cors";
import paymentsRouter from "./routes/payments";

const app = express();
const port = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Payment Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/payments", paymentsRouter);

app.get("/health", (req, res) => {
  res.json({ service: "payment-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`Payment Service listening on port ${port}`);
});
