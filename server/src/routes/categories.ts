import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/categories
router.get("/", async (req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await prisma.product.findMany({
        where: { categoryId: category.id },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return {
        category,
        products,
      };
    })
  );

  // Filter out empty categories
  const nonEmpty = categoriesWithProducts.filter(
    (group) => group.products.length > 0
  );

  res.json(nonEmpty);
});

export default router;
