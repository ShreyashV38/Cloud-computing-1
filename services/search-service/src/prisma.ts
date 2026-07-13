import { PrismaClient } from "../../../db/generated/prisma";
import "dotenv/config";

export const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});
