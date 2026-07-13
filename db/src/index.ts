import express from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 4010; // Use 4010 to avoid gateway collision

app.use(cors());
app.use(express.json());

// Generic query endpoint
app.post("/query", async (req, res) => {
  const { model, operation, args } = req.body;

  if (!model || !operation) {
    return res.status(400).json({ error: "model and operation are required" });
  }

  try {
    const delegate = (prisma as any)[model];
    if (!delegate || typeof delegate[operation] !== "function") {
      return res.status(400).json({ error: `Invalid operation ${operation} on model ${model}` });
    }

    const result = await delegate[operation](args || {});
    res.json(result);
  } catch (error: any) {
    console.error(`DB Query Error [${model}.${operation}]:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ service: "db-service", status: "running" });
});

app.listen(port, () => {
  console.log(`DB Service listening on port ${port}`);
});
