import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/orders
router.get("/", async (req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: {
            select: { name: true, image: true, category: { select: { name: true } } },
          },
        },
      },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders);
});

// POST /api/orders
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const { items, paymentMethod, shippingAddress, total } = body;

    if (!items || !items.length || !paymentMethod || !shippingAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Use demo user for now
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Guest",
          email: `guest_${Date.now()}@example.com`,
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: "confirmed",
        total: total,
        paymentMethod: paymentMethod,
        shippingAddress: shippingAddress,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
