import "./globals.css";
import HeaderClientOnly from "@/components/HeaderClientOnly";
import Footer from "@/components/Footer";
import SideCart from "@/components/SideCart";
import { CartProvider } from "@/context/CartContext";


export const metadata = {
  title: "HelloLoveDani | Premium Handmade Dog Accessories",
  description: "Discover premium handmade dog accessories, bandanas, and more at HelloLoveDani. Crafted with love for your stylish pup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <HeaderClientOnly />
          {children}
          <Footer />
          <SideCart />
        </CartProvider>
      </body>
    </html>
  );
}