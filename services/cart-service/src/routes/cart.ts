import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// GET /api/cart/:sessionId — get cart contents
router.get("/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
                stock: true,
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({ sessionId, items: [], total: 0, count: 0 });
    }

    const items = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      stock: item.product.stock,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ sessionId, items, total, count });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Failed to get cart" });
  }
});

// POST /api/cart/:sessionId/items — add item to cart
router.post("/:sessionId/items", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { sessionId } });
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: { select: { id: true, name: true, price: true, image: true } },
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// PUT /api/cart/:sessionId/items/:productId — update quantity
router.put("/:sessionId/items/:productId", async (req: Request, res: Response) => {
  try {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }

    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (quantity === 0) {
      // Remove item
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
      return res.json({ message: "Item removed from cart" });
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        cartId_productId: { cartId: cart.id, productId },
      },
      data: { quantity },
      include: {
        product: { select: { id: true, name: true, price: true, image: true } },
      },
    });

    res.json(cartItem);
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

// DELETE /api/cart/:sessionId/items/:productId — remove item
router.delete("/:sessionId/items/:productId", async (req: Request, res: Response) => {
  try {
    const { sessionId, productId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
});

// DELETE /api/cart/:sessionId — clear cart
router.delete("/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { sessionId } });
    if (!cart) {
      return res.json({ message: "Cart already empty" });
    }

    // Delete all items (cascade), then delete cart
    await prisma.cart.delete({ where: { sessionId } });

    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
