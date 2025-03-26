"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import bcrypt from 'bcryptjs'

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Query the admin table
      const { data: adminData, error: adminError } = await supabase
        .from("admin")
        .select("*")
        .eq("email", email.trim().toLowerCase()) // Trim and convert to lowercase
        .single();

      if (adminError || !adminData) {
        throw new Error("No admin found with that email");
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, adminData.password);
      if (!passwordMatch) throw new Error("Incorrect password");

      // Set admin session in cookies with proper attributes
      const cookieValue = JSON.stringify(adminData);
      const cookieAttributes = `path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax;`; // 1 week expiry
      document.cookie = `admin-session=${cookieValue}; ${cookieAttributes}`;

      // Redirect to admin dashboard
      window.location.href = "/admin-dashboard";
    } catch (error: any) {
      console.error("Login error:", error);
      alert(`Login failed: ${error?.message || "An error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center py-12 bg-gray-50">
        <div className="container px-4 md:px-6">
          <motion.div className="max-w-md mx-auto">
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
                <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Sign in to access the admin dashboard
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
                    <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white" disabled={loading}>
                      {loading ? "Logging in..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}