"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Coffee, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { supabase } from "@/lib/supabase"
import bcrypt from 'bcryptjs'
import { toast } from "sonner"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
  
      // Fetch user from your custom users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
  
      if (error) throw error;
      if (!data) throw new Error('No user found with that email');
  
      // Verify password
      const passwordMatch = await bcrypt.compare(password, data.password);
      if (!passwordMatch) throw new Error('Incorrect password');
  
      // Set user session in cookies
      document.cookie = `user-session=${JSON.stringify(data)}; path=/;`;
  
      // Redirect to dashboard
      window.location.href = '/customer-menu';
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error?.message || 'An error occurred'}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-md mx-auto">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="bg-brown-600 p-2 rounded-full"
                  >
                    <Coffee className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">Sign in to your Zelin Café account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-sm text-brown-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button type="submit" className="w-full bg-amber-700 text-white hover:bg-brown-700">
                      Sign In
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-brown-600 hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardFooter>
              <CardFooter className="flex flex-col">
                <div className="text-center text-sm">
                  Have Admin Account?{" "}
                  <Link href="/admin-login" className="text-brown-600 hover:underline">
                    Admin Login
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}