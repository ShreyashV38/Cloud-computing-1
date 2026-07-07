import { PrismaClient } from "../../db/generated/prisma";
import path from "path";
import "dotenv/config";

const dbPath = path.resolve(__dirname, "../../../db/dev.db");

export const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || `file:${dbPath}`
});
