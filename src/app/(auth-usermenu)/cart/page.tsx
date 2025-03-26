"use client"

import CustomerNavbar from "@/components/CustomerNavbar"
import Cart from "@/components/Cart"
import Footer from "../../components/footer"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <Cart />
      <Footer />
    </div>
  )
}