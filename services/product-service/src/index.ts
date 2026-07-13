import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";

const app = express();
const port = process.env.PORT || 4001;

// Allow internal routing from gateway, or direct localhost access
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Product Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

app.listen(port, () => {
  console.log(`Product Service listening on port ${port}`);
});
