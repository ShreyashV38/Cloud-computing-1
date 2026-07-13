import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/search?q=<query>&category=<slug>&minPrice=<n>&maxPrice=<n>&sortBy=<field>
router.get("/", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const category = req.query.category as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = (req.query.sortBy as string) || "relevance";
    const limit = parseInt((req.query.limit as string) || "20");

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query 'q' is required" });
    }

    const searchTerm = q.trim();

    // Build where clause
    const where: any = {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ],
    };

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      default:
        orderBy = { rating: "desc" }; // relevance = best rated
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
      },
      take: limit,
      orderBy,
    });

    res.json({
      query: searchTerm,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET /api/search/suggestions?q=<partial>
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        name: { contains: q.trim(), mode: "insensitive" },
      },
      select: { id: true, name: true, price: true, image: true },
      take: 5,
      orderBy: { rating: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});

export default router;
