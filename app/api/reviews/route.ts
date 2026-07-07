import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// GET /api/reviews?productId=xxx — Get reviews for a product
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews);
}

// POST /api/reviews — Create a review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json(
        { error: "productId and rating are required" },
        { status: 400 }
      );
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

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
