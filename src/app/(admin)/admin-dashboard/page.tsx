"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "YOUR_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY"
)

// Interface definitions
interface MenuItem {
  id: string
  menu_name: string
  menu_price: number
  menu_category: string
  created_at: string
}

interface Order {
  id: string
  user_id: string
  items: { id: string; menu_item_id: string; quantity: number }[]
  total: number
  status: string
  created_at: string
  order_reference?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [bestSellingItems, setBestSellingItems] = useState<{ name: string; value: number; color: string }[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [dailySales, setDailySales] = useState<{ name: string; sales: number }[]>([])
  const [monthlySales, setMonthlySales] = useState<{ name: string; total: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const session = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-session="))
        ?.split("=")[1]

      if (!session) {
        window.location.href = "/admin-login"
        return
      }

      const user = JSON.parse(session)
      setUser(user)
    }

    checkSession()
  }, [])

  // Fetch best selling items
  useEffect(() => {
    const fetchBestSellingItems = async () => {
      try {
        setLoading(true)
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("items")
          .eq("status", "completed")

        if (orderError) throw orderError

        const itemQuantities = orders?.flatMap((order) =>
          order.items.map((item: { menu_item_id: any; quantity: any }) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity }))
        ) || []

        const menuItemIds = [...new Set(itemQuantities.map((item) => item.menu_item_id))]
        const { data: menuItems, error: menuError } = await supabase
          .from("menu")
          .select("id, menu_name")
          .in("id", menuItemIds)

        if (menuError) throw menuError

        const itemCounts = itemQuantities.reduce((acc: { [key: string]: { name: string; quantity: number } }, item) => {
          const menuItem = menuItems?.find((menu: { id: string; menu_name: string }) => menu.id === item.menu_item_id)
          if (menuItem) {
            const name = menuItem.menu_name
            if (!acc[name]) {
              acc[name] = { name, quantity: 0 }
            }
            acc[name].quantity += item.quantity
          }
          return acc
        }, {})

        const aestheticColors = ["#FF6F61", "#6B7280", "#F4A261", "#2A9D8F", "#E76F51"] // Bright but aesthetic palette

        const topItems = Object.values(itemCounts)
          .sort((a: any, b: any) => b.quantity - a.quantity)
          .slice(0, 5)
          .map((item: any, index: number) => ({
            name: item.name,
            value: item.quantity,
            color: aestheticColors[index % aestheticColors.length],
          }))

        setBestSellingItems(topItems.length > 0 ? topItems : [])
      } catch (error) {
        toast.error("Failed to load best selling items")
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBestSellingItems()
  }, [])

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        if (data) {
          const numberedOrders = data.map((order, index) => ({
            ...order,
            order_reference: `Order #${data.length - index}`,
          }))
          setRecentOrders(numberedOrders as Order[])
        }
      } catch (error) {
        toast.error("Failed to load recent orders")
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentOrders()
  }, [])

  // Fetch daily sales
  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("orders")
          .select("created_at")
          .gte("created_at", new Date(new Date().setDate(new Date().getDate() - 6)).toISOString())

        if (error) throw error

        if (data) {
          const salesByDay = (data as Order[]).reduce((acc: { [key: string]: number }, order: Order) => {
            const date = new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "numeric" })
            acc[date] = (acc[date] || 0) + 1
            return acc
          }, {})

          const today = new Date()
          const currentWeek = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today)
            date.setDate(today.getDate() - 6 + i)
            return date.toLocaleDateString("en-US", { day: "numeric", month: "numeric" })
          })

          const dailySalesData = currentWeek.map((date) => ({
            name: date,
            sales: salesByDay[date] || 0,
          }))

          setDailySales(dailySalesData)
        }
      } catch (error) {
        toast.error("Failed to load daily sales")
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDailySales()
  }, [])

  // Fetch monthly sales
  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("orders")
          .select("total, created_at, status")
          .eq("status", "completed")
          .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString())
          .lte("created_at", new Date(new Date().getFullYear(), 11, 31).toISOString())

        if (error) throw error

        if (data) {
          const salesByMonth = (data as Order[]).reduce((acc: { [key: string]: number }, order: Order) => {
            const month = new Date(order.created_at).toLocaleString("en-US", { month: "short" })
            acc[month] = (acc[month] || 0) + order.total
            return acc
          }, {})

          const monthlySalesData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => ({
            name: month,
            total: salesByMonth[month] || 0,
          }))

          setMonthlySales(monthlySalesData)
        }
      } catch (error) {
        toast.error("Failed to load monthly sales")
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlySales()
  }, [])

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

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 space-y-6 p-6 w-full max-w-full">
        {user && (
          <div className="fixed top-4 right-4 bg-white p-2 rounded shadow">
            <p className="text-gray-700">Welcome, {user.user_metadata?.full_name || user.email}</p>
          </div>
        )}

        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 w-full shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Daily Sales</CardTitle>
              <CardDescription className="text-sm text-gray-500">Number of orders per day for the current week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySales}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="sales" stroke="#7d5a3c" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border border-gray-200 w-full shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">Total Sales for the Month</CardTitle>
              <CardDescription className="text-sm text-gray-500">Monthly sales comparison for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlySales}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip />
                  <Bar dataKey="total" fill="#7d5a3c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 w-full">
          <motion.div variants={itemVariants} className="w-full">
            <Card className="border border-gray-200 w-full shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Best Selling Items</CardTitle>
                <CardDescription className="text-sm text-gray-500">Top 5 best selling items this month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bestSellingItems}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => (
                        <text
                          style={{ fontSize: "12px", fill: "#333" }}
                          textAnchor="middle"
                        >
                          {`${name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      )}
                    >
                      {bestSellingItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="w-full">
            <Card className="border border-gray-200 w-full shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-800">Recent Orders</CardTitle>
                <CardDescription className="text-sm text-gray-500">Latest 5 orders received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="font-medium text-gray-800">{order.order_reference}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium text-gray-800">₱{order.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}