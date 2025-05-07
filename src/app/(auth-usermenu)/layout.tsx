import { Metadata } from "next"

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
      {children}
    </div>
  )
}