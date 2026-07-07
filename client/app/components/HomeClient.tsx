"use client";

import HeroBanner from "./HeroBanner";
import ProductGrid from "./ProductGrid";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  category: {
    name: string;
    slug: string;
  };
}

interface CategoryWithProducts {
  category: Category;
  products: Product[];
}

interface HomeClientProps {
  categoriesWithProducts: CategoryWithProducts[];
  searchResults: Product[] | null;
  searchQuery: string;
}

export default function HomeClient({
  categoriesWithProducts,
  searchResults,
  searchQuery,
}: HomeClientProps) {
  if (searchResults) {
    return (
      <div>
        <div id="products" style={{ paddingTop: "1.5rem" }}>
          <div className="animate-fade-in-up" style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.75rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Results for &ldquo;{searchQuery}&rdquo;
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {searchResults.length > 0 ? (
            <ProductGrid products={searchResults} />
          ) : (
            <div
              className="card py-16 text-center animate-fade-in"
              style={{ cursor: "default" }}
            >
              <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
                No products found
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                Try a different search term.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroBanner />

      <div id="products">
        {categoriesWithProducts.map((group, idx) => (
          <section key={group.category.id} className="category-section">
            <div
              className="category-header animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div>
                <h2 className="category-title">{group.category.name}</h2>
                <p className="category-count">
                  {group.products.length} product{group.products.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <ProductGrid products={group.products} />
          </section>
        ))}
      </div>
    </div>
  );
}
