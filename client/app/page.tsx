import HomeClient from "./components/HomeClient";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = params?.search;

  // If search is active, fetch from search-service via gateway
  if (searchQuery) {
    const res = await fetch(`http://127.0.0.1:4000/api/search?q=${encodeURIComponent(searchQuery)}`, {
      cache: "no-store", // dynamic
    });
    const data = await res.json();
    const searchResults = data.products || [];

    return (
      <HomeClient
        categoriesWithProducts={[]}
        searchResults={searchResults}
        searchQuery={searchQuery}
      />
    );
  }

  // Default: fetch categories with their products
  const res = await fetch("http://127.0.0.1:4000/api/categories", {
    cache: "no-store",
  });
  const categoriesWithProducts = await res.json();

  return (
    <HomeClient
      categoriesWithProducts={categoriesWithProducts}
      searchResults={null}
      searchQuery=""
    />
  );
}
