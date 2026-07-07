import express from "express";
import cors from "cors";
import reviewsRouter from "./routes/reviews";
import usersRouter from "./routes/users";

const app = express();
const port = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

app.use("/api/reviews", reviewsRouter);
app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
