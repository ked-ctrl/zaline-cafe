"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, useReducedMotion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import HeroProduct from "../../../public/images/herosectionImage.jpg"
import { useRouter } from 'next/navigation'


export default function Hero() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    // Set loaded state after component mounts for animations
    setIsLoaded(true)

    // Add scroll event listener for parallax effect
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Testimonials data
  const testimonials = [
    "Best coffee I've ever tasted!",
    "Their signature blend changed my mornings forever.",
    "A true coffee experience worth every penny."
  ]

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out"
        style={{
          backgroundImage: "url('/zelinBG.jpg')",
          filter: "brightness(0.75)",
          transform: `scale(1.1) translateY(${scrollPosition * 0.1}px)`,
        }}
        aria-hidden="true"
      />
      
      {/* Enhanced Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"
        aria-hidden="true"
      />

      {/* Content Container */}
      <div className="container relative z-10 px-4 md:px-8 mx-auto flex flex-col h-full pt-20">
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -30 }}
              animate={isLoaded ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center rounded-full bg-amber-600/20 px-3 py-1 text-sm text-amber-300 backdrop-blur-sm border border-amber-600/30"
              >
                Artisanal Coffee Since 2020
              </motion.div>
              
              {/* Heading with Enhanced Typography */}
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-2xl font-medium text-amber-100 tracking-wide"
                >
                  SPECIALTY COFFEE ROASTERS
                </motion.h2>
                
                <motion.h1
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white"
                >
                  Experience Coffee{" "}
                  <span className="text-amber-500 relative">
                    Perfection
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={isLoaded ? { scaleX: 1 } : {}}
                      transition={{ delay: 0.9, duration: 0.8 }}
                      className="absolute -bottom-2 left-0 h-1 w-full bg-amber-500 origin-left"
                    />
                  </span>
                </motion.h1>
              </div>
              
              {/* Description with Better Typography */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={isLoaded ? { opacity: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl font-light"
              >
                Handcrafted with passion, served with pride. Our beans are ethically sourced 
                and roasted to perfection, creating a rich and unforgettable experience with every cup.
              </motion.p>
              
              {/* CTA Buttons with Improved Design */}
              <motion.div
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-5 pt-4"
              >
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 h-auto rounded-md text-lg font-medium transition-all duration-300 shadow-xl hover:shadow-amber-600/30"
                  aria-label="Order Now"
                  onClick={() => router.push('/login')}
                >
                  Order Now
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-2 border-white/70 text-white px-8 py-6 h-auto rounded-md text-lg font-medium transition-all duration-300"
                  aria-label="View Menu"
                  onClick={() => router.push('/menu')}
                >
                  View Menu
                </Button>
              </motion.div>
              
              {/* Testimonial Carousel */}
              <div className="pt-6">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isLoaded ? { opacity: 0.8 } : {}}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="text-amber-200/70 text-sm uppercase tracking-wider mb-2"
                >
                  Our Customers Say
                </motion.p>
                <div className="h-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {testimonials.map((testimonial, index) => (
                      <motion.p
                        key={testimonial}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-white/80 text-lg font-light italic"
                      >
                        "{testimonial}"
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
            {/* Right Content - Featured Product */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.8, duration: 1 }}
              className="hidden md:flex justify-center items-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="aspect-square w-64 h-64 rounded-xl bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center mb-4 overflow-hidden">
                    {/* This would be your coffee product image */}
                    <div className="relative w-48 h-48">
                    <Image src={HeroProduct} alt="Puto Bumbong Latte coffee product" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-medium text-xl">Puto Bumbong Latte</h3>
                    <p className="text-amber-200 mt-1">Our award-winning blend</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-white font-bold text-2xl">$18.95</span>
                      <Button 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => router.push('/menu')}
                      >
                        View menu
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 0.8 } : {}}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="flex justify-center mt-auto mb-8"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center"
          >
            <span className="text-white/60 text-sm mb-2">Scroll to explore</span>
            <ChevronDown className="h-6 w-6 text-white/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}