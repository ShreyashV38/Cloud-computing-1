import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/reviews?productId=xxx
router.get("/", async (req: Request, res: Response) => {
  const productId = req.query.productId as string;

  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(reviews);
});

// POST /api/reviews
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { productId, rating, comment } = body;

    if (!productId || !rating) {
      return res.status(400).json({ error: "productId and rating are required" });
    }

    // Use demo user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Guest",
          email: `guest_${Date.now()}@example.com`,
        },
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        rating: Math.min(5, Math.max(1, rating)),
        comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Update product rating & count
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Review creation error:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

export default router;
