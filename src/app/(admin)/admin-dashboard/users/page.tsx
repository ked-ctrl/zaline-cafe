"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, Mail, Phone, User, ShoppingBag, UserPlus, ArrowUpDown } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "Customer" | "Staff" | "Admin"
  status: "active" | "inactive"
  joinDate: string
  orders: number
  totalSpent: string
  address: string
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", role: "Customer", address: "" })

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

  // Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        // Fetch users and admins
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name, role, created_at');
        
        if (usersError) throw usersError;

        const { data: adminData, error: adminError } = await supabase
          .from('admin')
          .select('id, email, created_at');
        
        if (adminError) throw adminError;

        // Fetch orders to determine user activity
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, user_id, total, status, created_at');
        
        if (ordersError) throw ordersError;

        // Define the threshold for "active" status (3 months ago from May 06, 2025)
        const threeMonthsAgo = new Date('2025-02-06T00:00:00Z'); // February 06, 2025

        const formattedUsers: User[] = [];

        // Process users (customers)
        if (usersData) {
          formattedUsers.push(
            ...usersData.map((users) => {
              const userOrders = ordersData ? ordersData.filter(order => order.user_id === users.id) : [];
              const orderCount = userOrders.length;
              const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2);
              const latestOrder = userOrders.length > 0 
                ? new Date(Math.max(...userOrders.map(order => new Date(order.created_at).getTime())))
                : null;
              const joinDate = users.created_at ? new Date(users.created_at) : null;
              const status = (latestOrder && latestOrder >= threeMonthsAgo) || (joinDate && joinDate >= threeMonthsAgo) 
                ? 'active' 
                : 'inactive';

              return {
                id: users.id,
                name: users.full_name || 'Unknown',
                email: users.email,
                phone: 'N/A',
                role: users.role || 'Customer',
                status: status as "active" | "inactive",
                joinDate: users.created_at ? new Date(users.created_at).toLocaleDateString() : 'N/A',
                orders: orderCount,
                totalSpent: totalSpent,
                address: 'N/A',
              };
            })
          );
        }

        // Process admins
        if (adminData) {
          formattedUsers.push(
            ...adminData.map((admin) => {
              const adminOrders = ordersData ? ordersData.filter(order => order.user_id === admin.id) : [];
              const orderCount = adminOrders.length;
              const totalSpent = adminOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2);
              const latestOrder = adminOrders.length > 0 
                ? new Date(Math.max(...adminOrders.map(order => new Date(order.created_at).getTime())))
                : null;
              const joinDate = admin.created_at ? new Date(admin.created_at) : null;
              const status = (latestOrder && latestOrder >= threeMonthsAgo) || (joinDate && joinDate >= threeMonthsAgo) 
                ? 'active' 
                : 'inactive';

              return {
                id: admin.id,
                name: 'Unknown',
                email: admin.email,
                phone: 'N/A',
                role: 'Admin' as const,
                status: status as "active" | "inactive",
                joinDate: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A',
                orders: orderCount,
                totalSpent: totalSpent,
                address: 'N/A',
              };
            })
          );
        }

        setUsers(formattedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((users) => {
    const matchesSearch =
      users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users.phone.includes(searchTerm)

    const matchesRole = roleFilter === "all" || users.role === roleFilter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && users.status === "active") ||
      (activeTab === "inactive" && users.status === "inactive")

    return matchesSearch && matchesRole && matchesTab
  })

  // Sort users
  const sortedUsers = [...filteredUsers]
  if (sortConfig !== null) {
    sortedUsers.sort((a, b) => {
      if (a[sortConfig.key as keyof User] < b[sortConfig.key as keyof User]) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (a[sortConfig.key as keyof User] > b[sortConfig.key as keyof User]) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = sortedUsers.slice(indexOfFirstItem, indexOfLastItem)

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const handleAddUser = async () => {
    try {
      let table = newUser.role === "Admin" ? "admin" : "users"
      let data = {
        email: newUser.email,
        full_name: newUser.name,
        phone: newUser.phone || null,
        role: newUser.role !== "Admin" ? newUser.role : null,
        address: newUser.address || null,
        created_at: new Date().toISOString(),
      }

      if (table === "admin") {
        delete (data as { role?: string }).role // admin table doesn't have role
      } else {
        data = { ...(data as typeof data), password: "default_password" } as typeof data & { password: string } // Add a default password for users
      }

      const { error } = await supabase.from(table).insert([data])

      if (error) throw error

      // Refresh users list
      const { data: usersData } = await supabase.from("users").select("id, email, full_name, role, created_at")
      const { data: adminData } = await supabase.from("admin").select("id, email, created_at")
      const { data: ordersData } = await supabase.from("orders").select("id, user_id, total, status, created_at")
      const threeMonthsAgo = new Date('2025-02-06T00:00:00Z'); // February 06, 2025
      const formattedUsers: User[] = []

      if (usersData) {
        formattedUsers.push(
          ...usersData.map((users) => {
            const userOrders = ordersData ? ordersData.filter(order => order.user_id === users.id) : []
            const orderCount = userOrders.length
            const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)
            const latestOrder = userOrders.length > 0 
              ? new Date(Math.max(...userOrders.map(order => new Date(order.created_at).getTime())))
              : null;
            const joinDate = users.created_at ? new Date(users.created_at) : null;
            const status = (latestOrder && latestOrder >= threeMonthsAgo) || (joinDate && joinDate >= threeMonthsAgo) 
              ? 'active' 
              : 'inactive';
            return {
              id: users.id,
              name: users.full_name || 'Unknown',
              email: users.email,
              phone: 'N/A',
              role: users.role || 'Customer',
              status: status as "active" | "inactive",
              joinDate: users.created_at ? new Date(users.created_at).toLocaleDateString() : 'N/A',
              orders: orderCount,
              totalSpent: totalSpent,
              address: 'N/A',
            }
          })
        )
      }

      if (adminData) {
        formattedUsers.push(
          ...adminData.map((admin) => {
            const adminOrders = ordersData ? ordersData.filter(order => order.user_id === admin.id) : []
            const orderCount = adminOrders.length
            const totalSpent = adminOrders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)
            const latestOrder = adminOrders.length > 0 
              ? new Date(Math.max(...adminOrders.map(order => new Date(order.created_at).getTime())))
              : null;
            const joinDate = admin.created_at ? new Date(admin.created_at) : null;
            const status = (latestOrder && latestOrder >= threeMonthsAgo) || (joinDate && joinDate >= threeMonthsAgo) 
              ? 'active' 
              : 'inactive';
            return {
              id: admin.id,
              name: 'Unknown',
              email: admin.email,
              phone: 'N/A',
              role: 'Admin' as const,
              status: status as "active" | "inactive",
              joinDate: admin.created_at ? new Date(admin.created_at).toLocaleDateString() : 'N/A',
              orders: orderCount,
              totalSpent: totalSpent,
              address: 'N/A',
            }
          })
        )
      }

      setUsers(formattedUsers)
      setNewUser({ name: "", email: "", phone: "", role: "Customer", address: "" })
      setIsAddDialogOpen(false)
    } catch (error: any) {
      console.error('Error adding users:', error.message)
      // Optionally show a toast error
    }
  }

  const nonAdminUsersCount = users.filter((users) => users.role !== "Admin").length

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage your customers, staff, and administrators</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" /> Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Full name"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="Email address"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                          placeholder="Phone number"
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <select
                          id="role"
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "Customer" | "Staff" | "Admin" })}
                          className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Customer">Customer</option>
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={newUser.address}
                          onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                          placeholder="Full address"
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser}>Save User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    Total Non-Admin Users: <span className="font-medium">{nonAdminUsersCount}</span>
                  </p>
                </div>

                <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Button
                    variant={roleFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("all")}
                  >
                    All Roles
                  </Button>
                  <Button
                    variant={roleFilter === "Customer" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("Customer")}
                  >
                    Customers
                  </Button>
                  <Button
                    variant={roleFilter === "Staff" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("Staff")}
                  >
                    Staff
                  </Button>
                  <Button
                    variant={roleFilter === "Admin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("Admin")}
                  >
                    Admins
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("name")}
                            className="flex items-center gap-1 p-0 h-auto font-medium"
                          >
                            Name
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("role")}
                            className="flex items-center gap-1 p-0 h-auto font-medium"
                          >
                            Role
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("joinDate")}
                            className="flex items-center gap-1 p-0 h-auto font-medium"
                          >
                            Joined
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => requestSort("orders")}
                            className="flex items-center gap-1 p-0 h-auto font-medium"
                          >
                            Orders
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUsers.map((users) => (
                        <TableRow key={users.id}>
                          <TableCell>
                            <Avatar>
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${users.name.charAt(0)}`}
                                alt={users.name}
                              />
                              <AvatarFallback>{users.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{users.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{users.email}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{users.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{users.role}</Badge>
                          </TableCell>
                          <TableCell>{users.joinDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-3 w-3 text-gray-500" />
                              <span>{users.orders}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {users.status === "active" ? "Active" : "Inactive"}
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
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShoppingBag className="mr-2 h-4 w-4" />
                                  View Orders
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">Deactivate Account</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{" "}
              <span className="font-medium">{filteredUsers.length}</span> users
            </p>
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
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}