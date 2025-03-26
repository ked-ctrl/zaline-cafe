"use client"

import { useState } from "react"
import Link from "next/link"
import { Coffee, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}>
            <Coffee className="h-6 w-6 text-brown-600" />
          </motion.div>
          <span className="text-xl font-bold">Zelin Café</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="relative">
            <motion.button
              onClick={toggleDropdown}
              className="flex items-center gap-1 text-sm font-medium hover:text-brown-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Menu
              <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                >
                  <div className="py-1">
                    <Link
                      href="menu"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Hot Coffee
                    </Link>
                    <Link
                      href="menu"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Cold Brew
                    </Link>
                    <Link
                      href="menu"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Specialty Drinks
                    </Link>
                    <Link
                      href="menu"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Pastries
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="/about" className="text-sm font-medium hover:text-brown-600 transition-colors">
              About
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link href="login" className="text-sm font-medium hover:text-brown-600 transition-colors">
              Login
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button className="bg-black hover:bg-black/80 text-white">
            <Link href="signup">
            Sign Up
            </Link>
            </Button>
          </motion.div>
        </nav>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t overflow-hidden"
          >
            <div className="container py-4 px-4 space-y-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    Menu <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem>
                    <Link href="#hot-coffee" className="w-full">
                      Hot Coffee
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#cold-brew" className="w-full">
                      Cold Brew
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#specialty-drinks" className="w-full">
                      Specialty Drinks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="#pastries" className="w-full">
                      Pastries
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="#about" className="block py-2 hover:text-brown-600">
                About
              </Link>
              <Link href="#login" className="block py-2 hover:text-brown-600">
                Login
              </Link>
              <Button className="w-full bg-black hover:bg-black/80 text-white">Sign Up</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

