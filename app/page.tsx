import { prisma } from "../lib/prisma";
import HomeClient from "./components/HomeClient";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params?.search;

  // If search is active, return flat search results
  if (searchQuery) {
    const searchResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery } },
          { description: { contains: searchQuery } },
        ],
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <HomeClient
        categoriesWithProducts={[]}
        searchResults={JSON.parse(JSON.stringify(searchResults))}
        searchQuery={searchQuery}
      />
    );
  }

  // Default: fetch categories with their products
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
        category: JSON.parse(JSON.stringify(category)),
        products: JSON.parse(JSON.stringify(products)),
      };
    })
  );

  // Filter out empty categories
  const nonEmpty = categoriesWithProducts.filter(
    (group) => group.products.length > 0
  );

  return (
    <HomeClient
      categoriesWithProducts={nonEmpty}
      searchResults={null}
      searchQuery=""
    />
  );
}
