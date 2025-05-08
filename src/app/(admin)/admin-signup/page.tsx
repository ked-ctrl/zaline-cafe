"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import bcrypt from 'bcryptjs'

export default function AdminSignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    e.preventDefault()
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password')
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10)

      // Insert the new admin into the admin table
      const { data, error } = await supabase
        .from('admin')
        .insert([{
          email: email.trim().toLowerCase(), // Trim and convert to lowercase
          password: hashedPassword, // Hashed password
          created_at: new Date().toISOString(), // Current timestamp
        }])
        .select()

      if (error) throw error
      if (!data) throw new Error('Failed to create admin account')

      // Redirect to admin login page
      router.push('/admin-login')
    } catch (error: any) {
      console.error("Signup error:", error)
      alert(`Signup failed: ${error?.message || 'An error occurred'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-md mx-auto">
            <Card className="border-2 border-gray-800">
              <CardHeader className="space-y-1">
                <div className="flex justify-center mb-2">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="bg-gray-800 p-2 rounded-full"
                  >
                    <Lock className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
                <CardTitle className="text-2xl text-center">Admin Signup</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Create a new admin account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/admin-login" className="text-gray-800 hover:underline">
                    Log in
                  </a>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}