import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

// POST /api/payments/process — process a payment
router.post("/process", async (req: Request, res: Response) => {
  try {
    const { amount, method, orderId } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ error: "amount and method are required" });
    }

    if (!["upi", "card"].includes(method)) {
      return res.status(400).json({ error: "Invalid payment method. Use 'upi' or 'card'" });
    }

    // Simulate payment processing delay (300-800ms)
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

    // Simulate ~95% success rate
    const isSuccess = Math.random() < 0.95;

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        orderId: orderId || null,
        amount,
        method,
        status: isSuccess ? "success" : "failed",
        transactionId,
      },
    });

    if (!isSuccess) {
      return res.status(402).json({
        success: false,
        message: "Payment failed. Please try again.",
        payment,
      });
    }

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

// GET /api/payments/:orderId — get payment status for an order
router.get("/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    if (payments.length === 0) {
      return res.status(404).json({ error: "No payment found for this order" });
    }

    res.json(payments);
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ error: "Failed to get payment status" });
  }
});

// GET /api/payments — list all payments (for demo/admin)
router.get("/", async (req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(payments);
  } catch (error) {
    console.error("List payments error:", error);
    res.status(500).json({ error: "Failed to list payments" });
  }
});

export default router;
