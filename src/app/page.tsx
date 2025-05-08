import Navbar from "./components/navbar"
import Hero from "./components/hero"
import Gallery from "./components/gallery"
import Footer from "./components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Gallery />
      <main className="flex-1">{/* Additional content can be added here */}</main>
      <Footer />
    </div>
  )
}

