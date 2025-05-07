"use client"

import { useState, useEffect } from "react"
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
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  sugarPercentage?: number;
}

interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  customer_name?: string;
  menu_items?: { [key: string]: string };
}

interface ItemPerformance {
  name: string;
  value: number;
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemPerformanceData, setItemPerformanceData] = useState<ItemPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Fetch orders and related data from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            id,
            user_id,
            items,
            total,
            status,
            created_at,
            users (full_name)
          `)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const { data: menuData, error: menuError } = await supabase
          .from("menu")
          .select("id, menu_name");

        if (menuError) throw menuError;

        const menuMap = menuData.reduce((acc: { [key: string]: string }, item: any) => {
          acc[item.id] = item.menu_name;
          return acc;
        }, {});

        const processedOrders = ordersData.map((order: any) => ({
          id: order.id,
          user_id: order.user_id,
          items: order.items,
          total: order.total,
          status: order.status === "processing" ? "pending" : order.status, // Map "processing" to "pending"
          created_at: order.created_at,
          customer_name: order.users?.full_name || "Unknown",
          menu_items: menuMap,
        }));

        setOrders(processedOrders);

        const itemCounts: { [key: string]: number } = {};
        ordersData.forEach((order: any) => {
          order.items.forEach((item: OrderItem) => {
            const itemName = menuMap[item.menu_item_id] || "Unknown Item";
            itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
          });
        });

        const performanceData = Object.entries(itemCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 7);

        setItemPerformanceData(performanceData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        order.menu_items?.[item.menu_item_id]?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders];
  if (sortConfig !== null) {
    sortedOrders.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Order];
      let bValue: any = b[sortConfig.key as keyof Order];

      if (sortConfig.key === "date") {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else if (sortConfig.key === "total") {
        aValue = Number(a.total);
        bValue = Number(b.total);
      } else if (sortConfig.key === "customer") {
        aValue = a.customer_name;
        bValue = b.customer_name;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate order status counts
  const statusCounts = {
    completed: orders.filter((order) => order.status === "completed").length,
    pending: orders.filter((order) => order.status === "pending").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
  };

  // Generate timeline data
  const timelineData = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];
    
    const dailyOrders = orders.filter((order) => {
      const orderDate = new Date(order.created_at).toISOString().split("T")[0];
      return orderDate === dateString;
    });

    const dailyTotal = dailyOrders.reduce((sum, order) => sum + Number(order.total), 0);

    timelineData.push({
      date: date.toLocaleDateString(),
      orderCount: dailyOrders.length,
      total: dailyTotal,
    });
  }

  // Handle status update
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle order cancellation
  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, "cancelled");
  };

  // Handle view details
  const viewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Order Analytics</CardTitle>
            <CardDescription>Monthly performance of items and order statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">Completed</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{statusCounts.completed}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">Pending</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{statusCounts.pending}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm">Cancelled</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{statusCounts.cancelled}</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Order timeline for the last 5 days</p>
                    <div className="border rounded-md p-4">
                      <div className="space-y-8">
                        {timelineData.map((entry, i) => (
                          <div key={i} className="relative pl-6 border-l border-gray-200">
                            <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-brown-600"></div>
                            <time className="block text-sm font-normal leading-none text-gray-500">
                              {entry.date}
                            </time>
                            <p className="text-base font-semibold">{entry.orderCount} orders</p>
                            <p className="text-sm text-gray-600">Total: ₱{entry.total.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : (
              <>
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
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("customer")}
                            className="flex items-center gap-1 p-0 h-auto font-medium"
                          >
                            Customer
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
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
                      {currentOrders.map((order, index) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{startIndex + index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(order.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="text-sm">
                                  {item.quantity}x {order.menu_items?.[item.menu_item_id] || "Unknown Item"}
                                  {item.sugarPercentage ? ` (Sugar: ${item.sugarPercentage}%)` : ""}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">₱{order.total.toFixed(2)}</TableCell>
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
                                <DropdownMenuItem onClick={() => viewDetails(order)}>
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => updateOrderStatus(order.id, "completed")}
                                  disabled={updatingStatus || order.status === "completed" || order.status === "cancelled"}
                                >
                                  Update to Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => cancelOrder(order.id)}
                                  disabled={updatingStatus || order.status === "cancelled"}
                                  className="text-red-600"
                                >
                                  Cancel order
                                </DropdownMenuItem>
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
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(endIndex, sortedOrders.length)}</span> of{" "}
                    <span className="font-medium">{sortedOrders.length}</span> orders
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details - #{sortedOrders.findIndex(o => o.id === selectedOrder?.id) + 1}</DialogTitle>
            <DialogDescription>
              Detailed information about the selected order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Date & Time:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p><strong>Total:</strong> ₱{selectedOrder.total.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</p>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc pl-5 mt-2">
                  {selectedOrder.items.map((item, i) => (
                    <li key={i}>
                      {item.quantity}x {selectedOrder.menu_items?.[item.menu_item_id] || "Unknown Item"}
                      {item.sugarPercentage ? ` (Sugar: ${item.sugarPercentage}%)` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}