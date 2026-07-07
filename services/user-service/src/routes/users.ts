import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/users
router.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { addresses: true },
  });
  res.json(users);
});

export default router;
