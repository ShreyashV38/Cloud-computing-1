import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Audio",
    slug: "audio",
    description: "Premium headphones, earbuds, and speakers",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  },
  {
    name: "Smart Devices",
    slug: "smart-devices",
    description: "Smartwatches, laptops, and smartphones",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
  },
  {
    name: "Peripherals",
    slug: "peripherals",
    description: "Keyboards, cameras, and accessories",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
  },
];

const productsByCategory: Record<
  string,
  Array<{
    name: string;
    price: number;
    image: string;
    description: string;
    stock: number;
    rating: number;
    reviewCount: number;
  }>
> = {
  audio: [
    {
      name: "Sony WH-1000XM5 Headphones",
      price: 24990,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      description: "Industry-leading noise cancelling over-ear headphones with exceptional sound quality and 30-hour battery life.",
      stock: 45,
      rating: 4.8,
      reviewCount: 342,
    },
    {
      name: "Apple AirPods Pro",
      price: 20990,
      image: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&q=80",
      description: "Active noise cancellation wireless earbuds with spatial audio and MagSafe charging case.",
      stock: 60,
      rating: 4.7,
      reviewCount: 512,
    },
    {
      name: "JBL Flip 6 Bluetooth Speaker",
      price: 8999,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
      description: "Portable waterproof Bluetooth speaker with powerful JBL Original Pro Sound and 12-hour playtime.",
      stock: 80,
      rating: 4.6,
      reviewCount: 278,
    },
    {
      name: "Marshall Stanmore II Speaker",
      price: 37999,
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
      description: "Iconic rock 'n' roll wireless speaker with powerful multi-directional sound and classic vintage design.",
      stock: 20,
      rating: 4.9,
      reviewCount: 156,
    },
  ],
  "smart-devices": [
    {
      name: "Apple Watch Series 9",
      price: 41900,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
      description: "Advanced health and fitness smartwatch with always-on Retina display, blood oxygen sensor, and ECG.",
      stock: 35,
      rating: 4.8,
      reviewCount: 423,
    },
    {
      name: 'MacBook Air 15" M3',
      price: 134900,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
      description: "Supercharged by M3 chip. Strikingly thin laptop with 15.3-inch Liquid Retina display and 18-hour battery.",
      stock: 25,
      rating: 4.9,
      reviewCount: 267,
    },
    {
      name: "iPhone 15 Pro",
      price: 134900,
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&q=80",
      description: "Titanium design smartphone with A17 Pro chip, 48MP camera system, and USB-C connectivity.",
      stock: 40,
      rating: 4.7,
      reviewCount: 589,
    },
  ],
  peripherals: [
    {
      name: "Mechanical RGB Keyboard",
      price: 4999,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
      description: "Hot-swappable mechanical keyboard with per-key RGB lighting and premium PBT keycaps.",
      stock: 90,
      rating: 4.5,
      reviewCount: 312,
    },
    {
      name: "Sony Alpha A7 III Camera",
      price: 164990,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
      description: "Full-frame mirrorless camera with 24.2MP sensor, 4K video, and 693-point autofocus system.",
      stock: 15,
      rating: 4.9,
      reviewCount: 198,
    },
    {
      name: "Logitech MX Master 3S Mouse",
      price: 8995,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80",
      description: "Ergonomic wireless mouse with MagSpeed scroll, 8K DPI tracking, and multi-device connectivity.",
      stock: 70,
      rating: 4.6,
      reviewCount: 234,
    },
  ],
};

const reviewComments = [
  "Absolutely love it! The quality is outstanding.",
  "Great product, exactly as described.",
  "Good value for money. Highly recommended.",
  "Delivery was fast and packaging was excellent.",
  "Perfect for gifting. My family loved it!",
  "Exceeded my expectations. Will buy again!",
  "Solid build quality, works perfectly.",
  "Premium feel, worth every penny.",
  "Must-have product. Five stars!",
  "Best purchase I've made this year.",
];

async function main() {
  console.log("Starting seed with 10 tech products...\n");

  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleaned existing data\n");

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
    console.log(`Category: ${created.name}`);
  }

  const allProducts: Array<{ id: string; name: string }> = [];
  for (const [slug, products] of Object.entries(productsByCategory)) {
    for (const p of products) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          price: p.price,
          image: p.image,
          description: p.description,
          stock: p.stock,
          rating: p.rating,
          reviewCount: p.reviewCount,
          categoryId: categoryMap[slug],
        },
      });
      allProducts.push({ id: product.id, name: product.name });
    }
    console.log(`Products for ${slug}: ${products.length} created`);
  }

  console.log(`\nTotal products created: ${allProducts.length}`);

  const user = await prisma.user.create({
    data: { name: "Shrey", email: "shrey@example.com", phone: "+91 98765 43210" },
  });
  console.log(`\nUser: ${user.name}`);

  await prisma.address.create({
    data: {
      userId: user.id, label: "Home", name: "Shrey", phone: "+91 98765 43210",
      line1: "42, Park Street", line2: "Near Central Mall", city: "Mumbai", state: "Maharashtra", pincode: "400001", isDefault: true,
    },
  });
  console.log("Address: Home (Mumbai)");

  for (const product of allProducts) {
    const numReviews = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numReviews; i++) {
      await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4,
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          userId: user.id,
          productId: product.id,
        },
      });
    }
  }
  console.log(`Reviews created for ${allProducts.length} products`);

  const sampleOrders = [
    { products: allProducts.slice(0, 3), status: "delivered", payment: "upi" },
    { products: allProducts.slice(5, 8), status: "shipped", payment: "card" },
  ];

  for (const orderData of sampleOrders) {
    let orderTotal = 0;
    const orderItemsData: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const sp of orderData.products) {
      const fullProduct = await prisma.product.findUnique({ where: { id: sp.id } });
      if (fullProduct) {
        const qty = Math.floor(Math.random() * 2) + 1;
        orderItemsData.push({ productId: fullProduct.id, quantity: qty, price: fullProduct.price });
        orderTotal += fullProduct.price * qty;
      }
    }

    await prisma.order.create({
      data: {
        userId: user.id, status: orderData.status, total: orderTotal, paymentMethod: orderData.payment,
        shippingAddress: "42, Park Street, Near Central Mall, Mumbai, Maharashtra - 400001", items: { create: orderItemsData },
      },
    });
  }
  console.log("Sample orders created\nSeeding complete!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
