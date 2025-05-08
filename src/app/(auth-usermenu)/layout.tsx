import { Metadata } from "next"
import { CartProvider } from "@/contexts/CartContext"

export const metadata: Metadata = {
  title: "Zelin Café",
  description: "Modern coffee shop management system",
}

export default function AuthUserMenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <CartProvider>
        {children}
      </CartProvider>
    </div>
  )
}