import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/products
router.get("/", async (req: Request, res: Response) => {
  const category = req.query.category as string;
  const search = req.query.search as string;
  const limit = parseInt((req.query.limit as string) || "50");

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Get related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: { select: { name: true, slug: true } },
    },
    take: 4,
  });

  res.json({
    product,
    relatedProducts
  });
});

export default router;
