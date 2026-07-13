import express from "express";
import cors from "cors";
import searchRouter from "./routes/search";

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Search Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/search", searchRouter);

app.get("/health", (req, res) => {
  res.json({ service: "search-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`Search Service listening on port ${port}`);
});
