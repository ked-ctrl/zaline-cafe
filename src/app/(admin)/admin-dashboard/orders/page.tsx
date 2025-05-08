"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MoreHorizontal, ArrowUpDown, BarChart, PieChart, Calendar } from "lucide-react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Mock data for orders
const generateOrders = (count: number) => {
  const statuses = ["completed", "processing", "pending", "cancelled"]
  const items = [
    "Cappuccino",
    "Latte",
    "Espresso",
    "Cold Brew",
    "Mocha",
    "Americano",
    "Flat White",
    "Macchiato",
    "Affogato",
    "Cortado",
  ]

  return Array.from({ length: count }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 30))

    const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => {
      const item = items[Math.floor(Math.random() * items.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
      const price = (Math.random() * 5 + 3).toFixed(2)
      return { item, quantity, price }
    })

    const total = orderItems.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)

    return {
      id: `ORD-${10000 + i}`,
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      customer: `Customer ${i + 1}`,
      items: orderItems,
      total: total.toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }
  })
}

const orders = generateOrders(50)

// Data for monthly item performance
const itemPerformanceData = [
  { name: "Cappuccino", value: 120 },
  { name: "Latte", value: 98 },
  { name: "Espresso", value: 86 },
  { name: "Cold Brew", value: 99 },
  { name: "Mocha", value: 85 },
  { name: "Americano", value: 65 },
  { name: "Flat White", value: 74 },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)

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

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) => item.item.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort orders
  const sortedOrders = [...filteredOrders]
  if (sortConfig !== null) {
    sortedOrders.sort((a, b) => {
      if (a[sortConfig.key as keyof typeof a] < b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof typeof a] > b[sortConfig.key as keyof typeof b]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Order Analytics</CardTitle>
            <CardDescription>Monthly performance of items and order statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="items">
              <TabsList className="mb-4">
                <TabsTrigger value="items">
                  <BarChart className="h-4 w-4 mr-2" />
                  Item Performance
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <PieChart className="h-4 w-4 mr-2" />
                  Order Status
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
              <TabsContent value="items">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={itemPerformanceData}
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
                      <Bar dataKey="value" fill="#7d5a3c" name="Orders" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="orders">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {orders.filter((order) => order.status === "completed").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Processing</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {orders.filter((order) => order.status === "processing").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {orders.filter((order) => order.status === "pending").length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        {orders.filter((order) => order.status === "cancelled").length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="timeline">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Order timeline for the last 30 days</p>
                  <div className="border rounded-md p-4">
                    <div className="space-y-8">
                      {[...Array(5)].map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - i)
                        return (
                          <div key={i} className="relative pl-6 border-l border-gray-200">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-brown-600"></div>
                            <time className="block text-sm font-normal leading-none text-gray-500">
                              {date.toLocaleDateString()}
                            </time>
                            <p className="text-base font-semibold">{Math.floor(Math.random() * 10) + 5} orders</p>
                            <p className="text-sm text-gray-600">Total: ${(Math.random() * 500 + 100).toFixed(2)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Manage and monitor all orders</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("id")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Order ID
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("date")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Date & Time
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("total")}
                        className="flex items-center gap-1 p-0 h-auto font-medium ml-auto"
                      >
                        Total
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.date}</span>
                          <span className="text-xs text-gray-500">{order.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="text-sm">
                              {item.quantity}x {item.item}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${order.total}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Update status</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Cancel order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
                <span className="font-medium">{filteredOrders.length}</span> orders
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

