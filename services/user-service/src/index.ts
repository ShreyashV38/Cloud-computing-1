import express from "express";
import cors from "cors";
import usersRouter from "./routes/users";

const app = express();
const port = process.env.PORT || 4008;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[User Service] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/users", usersRouter);

app.get("/health", (req, res) => {
  res.json({ service: "user-service", status: "running", port });
});

app.listen(port, () => {
  console.log(`User Service listening on port ${port}`);
});
