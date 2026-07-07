import express from "express"; // Restart 2
import cors from "cors";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import ordersRouter from "./routes/orders";
import reviewsRouter from "./routes/reviews";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/reviews", reviewsRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
