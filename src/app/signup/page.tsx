"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Coffee, Eye, EyeOff, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { supabase } from "@/lib/supabase"
import bcrypt from 'bcryptjs'
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [resetStep, setResetStep] = useState(1) // Step 1: Enter email, Step 2: Enter new password
  const router = useRouter()

  useEffect(() => {
    setPasswordMismatch(password !== confirmPassword && password !== "" && confirmPassword !== "");
  }, [password, confirmPassword]);

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

    if (passwordMismatch) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            full_name: name
          }
        ])
        .select()
        .single()

      if (error) throw error

      toast.success("You have successfully signed up! Please enter your credentials to log in.")

      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      console.error("Signup error:", error)
      toast.error(`Signup failed: ${error?.message || 'Unknown error occurred'}`)
    }
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (resetStep === 1) {
        // Step 1: Verify email exists
        const { data, error } = await supabase
          .from('users')
          .select()
          .eq('email', resetEmail)
          .single()

        if (error) throw error
        if (!data) throw new Error('No user found with that email')

        toast.success("Email verified! Please enter your new password.")
        setResetStep(2)
      } else {
        // Step 2: Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const { error } = await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('email', resetEmail)

        if (error) throw error

        toast.success("Password reset successfully! Please log in with your new password.")
        setShowResetPassword(false)
        setResetEmail("")
        setNewPassword("")
        setResetStep(1)
      }
    } catch (error: any) {
      console.error("Reset Password error:", error)
      toast.error(`Error: ${error?.message || 'An error occurred'}`)
    }
  }

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
                <CardTitle className="text-2xl text-center">Create an account</CardTitle>
                <CardDescription className="text-center">Sign up for your Zelin Café account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Juan Dela Cruz"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
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
                      <Label htmlFor="password">Password</Label>
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
                      <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                      {passwordMismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordMismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Dialog open={showTerms} onOpenChange={setShowTerms}>
                          <DialogTrigger asChild>
                            <button type="button" className="text-brown-600 hover:underline">
                              Terms of Service
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogTitle className="text-lg font-semibold text-center">
                              Terms of Service
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                              <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900">1. Acceptance of Terms</h3>
                                <p>
                                  By accessing or using the services of Zelin Café, located in Parañaque, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">2. Use of Services</h3>
                                <p>
                                  You agree to use Zelin Café’s services, including our website and ordering system, for lawful purposes only. You must be at least 13 years old to create an account. You are responsible for maintaining the confidentiality of your account credentials.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">3. Orders and Payments</h3>
                                <p>
                                  All orders placed through our website are subject to availability. Prices are subject to change without notice. Payments must be made in full at the time of order. Refunds are issued at the discretion of Zelin Café, typically within 7 days of a cancellation request, provided the order has not been fulfilled.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">4. User Conduct</h3>
                                <p>
                                  You agree not to engage in any activity that disrupts or interferes with our services, including submitting false information, attempting to access unauthorized accounts, or engaging in fraudulent transactions.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">5. Limitation of Liability</h3>
                                <p>
                                  Zelin Café is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services, including but not limited to issues with order fulfillment, website downtime, or data breaches, to the extent permitted by law.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">6. Modifications to Terms</h3>
                                <p>
                                  We reserve the right to update these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of the updated Terms.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">7. Governing Law</h3>
                                <p>
                                  These Terms are governed by the laws of the Philippines. Any disputes arising under these Terms shall be resolved in the courts of Parañaque City.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">8. Contact Us</h3>
                                <p>
                                  For questions about these Terms, please contact us at zelincafe.paranaque@gmail.com or visit us at our location in Sucat, Parañaque.
                                </p>
                              </div>
                            </DialogDescription>
                          </DialogContent>
                        </Dialog>
                        {" "}and{" "}
                        <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
                          <DialogTrigger asChild>
                            <button type="button" className="text-brown-600 hover:underline">
                              Privacy Policy
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                            <DialogTitle className="text-lg font-semibold text-center">
                              Privacy Policy
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                              <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900">1. Introduction</h3>
                                <p>
                                  Zelin Café, located in Parañaque, values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services, including our website and ordering system.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">2. Information We Collect</h3>
                                <p>
                                  We may collect the following personal information: <br />
                                  - Name, email address, and contact details when you create an account or place an order. <br />
                                  - Browsing data, such as IP address and cookies, to improve your website experience.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">3. How We Use Your Information</h3>
                                <p>
                                  Your information is used to: <br />
                                  - Process and fulfill your orders. <br />
                                  - Communicate with you about your account or orders. <br />
                                  - Improve our services and personalize your experience. <br />
                                  - Comply with legal obligations.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">4. Sharing Your Information</h3>
                                <p>
                                  We do not sell your personal information. We may share your information with: <br />
                                  - Service providers who assist in operating our services. <br />
                                  - Legal authorities if required by law.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">5. Data Security</h3>
                                <p>
                                  We use industry-standard measures, such as encryption and secure servers, to protect your data. Passwords are hashed using bcrypt. However, no system is completely secure, and we cannot guarantee absolute security.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">6. Your Rights</h3>
                                <p>
                                  You have the right to: <br />
                                  - Access, update, or delete your personal information by contacting us. <br />
                                  - Opt out of marketing communications. <br />
                                  - Request information about how your data is used.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">7. Cookies</h3>
                                <p>
                                  We use cookies to enhance your browsing experience. You can manage cookie preferences through your browser settings.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">8. Changes to This Policy</h3>
                                <p>
                                  We may update this Privacy Policy periodically. Changes will be posted on our website, and the updated policy will be effective immediately upon posting.
                                </p>
                                <h3 className="text-base font-semibold text-gray-900">9. Contact Us</h3>
                                <p>
                                  For questions about this Privacy Policy, please contact us at zelincafe.paranaque@gmail.com or visit us at our location in Sucat, Parañaque.
                                </p>
                              </div>
                            </DialogDescription>
                          </DialogContent>
                        </Dialog>
                      </Label>
                    </div>
                    <Button type="submit" className="w-full bg-amber-700 text-white" disabled={!agreeTerms}>
                      Create Account
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-brown-600 hover:underline">
                    Sign in
                  </Link>
                </div>
                <div className="text-center text-sm">
                  <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
                    <DialogTrigger asChild>
                      <button type="button" className="text-brown-600 hover:underline">
                        Forgot Password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogTitle className="text-lg font-semibold text-center">
                        Reset Password
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500 text-center">
                        {resetStep === 1
                          ? "Enter your email to verify your account."
                          : "Enter your new password."}
                      </DialogDescription>
                      <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                        {resetStep === 1 ? (
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <div className="relative">
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="your.email@example.com"
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                              />
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              placeholder="••••••••"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                          </div>
                        )}
                        <Button type="submit" className="w-full bg-amber-700 text-white hover:bg-brown-700">
                          {resetStep === 1 ? "Verify Email" : "Reset Password"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
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