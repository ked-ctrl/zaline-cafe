"use client"

import CustomerNavbar from "@/components/CustomerNavbar"
import Footer from "../../components/footer"
import { Cart } from "@/components/Cart"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CustomerNavbar />
      <Cart />
      <Footer />
    </div>
  )
}