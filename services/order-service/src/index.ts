import express from "express";
import cors from "cors";
import ordersRouter from "./routes/orders";

const app = express();
const port = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

app.use("/api/orders", ordersRouter);

app.listen(port, () => {
  console.log(`Order Service listening on port ${port}`);
});
