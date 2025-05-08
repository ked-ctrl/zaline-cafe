"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users, Coffee } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { supabase } from "@/lib/supabase"
import { Menu } from "@/components/Menu"
import { toast } from "sonner"

// Mock data for the dashboard
const revenueData = [
  { name: "Jan", revenue: 4000, expenses: 2400 },
  { name: "Feb", revenue: 3000, expenses: 1398 },
  { name: "Mar", revenue: 2000, expenses: 9800 },
  { name: "Apr", revenue: 2780, expenses: 3908 },
  { name: "May", revenue: 1890, expenses: 4800 },
  { name: "Jun", revenue: 2390, expenses: 3800 },
  { name: "Jul", revenue: 3490, expenses: 4300 },
  { name: "Aug", revenue: 4000, expenses: 2400 },
  { name: "Sep", revenue: 3000, expenses: 1398 },
  { name: "Oct", revenue: 2000, expenses: 9800 },
  { name: "Nov", revenue: 2780, expenses: 3908 },
  { name: "Dec", revenue: 1890, expenses: 4800 },
]

const salesData = [
  { name: "Mon", sales: 20 },
  { name: "Tue", sales: 15 },
  { name: "Wed", sales: 25 },
  { name: "Thu", sales: 22 },
  { name: "Fri", sales: 30 },
  { name: "Sat", sales: 40 },
  { name: "Sun", sales: 35 },
]

const bestSellingItems = [
  { name: "Cappuccino", value: 400, color: "#7d5a3c" },
  { name: "Latte", value: 300, color: "#a67c52" },
  { name: "Espresso", value: 200, color: "#5e4330" },
  { name: "Cold Brew", value: 150, color: "#8c6d4f" },
  { name: "Mocha", value: 100, color: "#4a3526" },
]

const COLORS = ["#7d5a3c", "#a67c52", "#5e4330", "#8c6d4f", "#4a3526"]

interface MenuItem {
  id: string
  menu_name: string
  menu_description: string
  menu_price: number
  menu_category: string
  menu_image: string
  available: boolean
  featured: boolean
  stock: number
}

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState("weekly")
  const [user, setUser] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const session = document.cookie
        .split("; ")
        .find((row) => row.startsWith("admin-session="))
        ?.split("=")[1];
  
      if (!session) {
        window.location.href = "/admin-login";
        return;
      }
  
      const user = JSON.parse(session);
      setUser(user);
    };
  
    checkSession();
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('menu')
          .select('*')
          .order('menu_name')

        if (error) throw error

        if (data) {
          setMenuItems(data as MenuItem[])
        }
      } catch (error) {
        toast.error('Failed to load menu items')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    // Implement your edit logic here
    console.log('Editing item:', item)
    // Example: Open edit modal or navigate to edit page
  }

  // Handle delete
  const handleDelete = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      // Remove item from local state
      setMenuItems(prev => prev.filter(i => i.id !== item.id))
      toast.success('Item deleted successfully')
    } catch (error) {
      toast.error('Failed to delete item')
      console.error('Error:', error)
    }
  }

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {user && (
        <div className="fixed top-4 right-4 bg-white p-2 rounded shadow">
          <p>Welcome, {user.user_metadata?.full_name || user.email}</p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+20.1% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+12.2% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <div className="flex items-center text-xs text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                <span>+8.4% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,234.50</div>
              <div className="flex items-center text-xs text-red-500">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                <span>+4.3% from last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue vs Expenses</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison of revenue and expenses for the current year</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#7d5a3c" name="Revenue" />
                    <Bar dataKey="expenses" fill="#a67c52" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales</CardTitle>
                <CardDescription>Number of orders per day for the current week</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="sales" stroke="#7d5a3c" strokeWidth={2} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Items</CardTitle>
              <CardDescription>Top 5 best selling items this month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bestSellingItems}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {bestSellingItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((order) => (
                  <div key={order} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-brown-600" />
                      <div>
                        <p className="text-sm font-medium">Order #{Math.floor(Math.random() * 10000)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(Date.now() - Math.random() * 86400000 * 2).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium">${(Math.random() * 50 + 10).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-2">Loading menu...</span>
        </div>
      ) : (
        <Menu
          items={menuItems}
          isAdmin={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </motion.div>
  )
}

