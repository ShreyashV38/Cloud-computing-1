import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "TechStore — Premium Tech Products",
  description:
    "Discover top-rated tech products — from premium headphones and smartwatches to laptops and cameras. Shop now with free delivery.",
  keywords: "tech products, headphones, smartwatch, laptop, camera, online shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "var(--font-body)" }}>
        <CartProvider>
          <Navbar />
          <main
            className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
            style={{ maxWidth: "1200px", minHeight: "calc(100vh - 200px)" }}
          >
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
