import express from "express";
import cors from "cors";
import reviewsRouter from "./routes/reviews";

const app = express();
const port = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Review Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/reviews", reviewsRouter);

app.get("/health", (req, res) => {
  res.json({ service: "review-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`Review Service listening on port ${port}`);
});
