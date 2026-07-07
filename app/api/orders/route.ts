import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/orders — List all orders (demo: returns all orders)
export async function GET() {
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

  return NextResponse.json(orders);
}

// POST /api/orders — Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, paymentMethod, shippingAddress, total } = body;

    if (!items || !items.length || !paymentMethod || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
