"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Search, MoreHorizontal, Edit, Trash2, FolderPlus, ArrowUpDown } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

// Mock data for categories
const categories = [
  {
    id: 1,
    name: "Hot Coffee",
    description: "Freshly brewed hot coffee drinks",
    itemCount: 15,
    active: true,
    featured: true,
    color: "#7d5a3c",
  },
  {
    id: 2,
    name: "Cold Brew",
    description: "Cold brewed coffee and iced drinks",
    itemCount: 12,
    active: true,
    featured: true,
    color: "#a67c52",
  },
  {
    id: 3,
    name: "Specialty Drinks",
    description: "Signature and seasonal specialty beverages",
    itemCount: 8,
    active: true,
    featured: false,
    color: "#5e4330",
  },
  {
    id: 4,
    name: "Pastries",
    description: "Freshly baked pastries and breakfast items",
    itemCount: 10,
    active: true,
    featured: true,
    color: "#8c6d4f",
  },
  {
    id: 5,
    name: "Sandwiches",
    description: "Fresh sandwiches and savory options",
    itemCount: 6,
    active: true,
    featured: false,
    color: "#4a3526",
  },
  {
    id: 6,
    name: "Desserts",
    description: "Sweet treats and dessert options",
    itemCount: 7,
    active: true,
    featured: false,
    color: "#b38867",
  },
  {
    id: 7,
    name: "Merchandise",
    description: "Coffee beans, mugs, and branded items",
    itemCount: 9,
    active: true,
    featured: false,
    color: "#9b7b5f",
  },
  {
    id: 8,
    name: "Seasonal",
    description: "Limited time seasonal offerings",
    itemCount: 4,
    active: false,
    featured: false,
    color: "#c19a78",
  },
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort categories
  const sortedCategories = [...filteredCategories]
  if (sortConfig !== null) {
    sortedCategories.sort((a, b) => {
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

  // Prepare data for pie chart
  const pieChartData = categories
    .filter((category) => category.active)
    .map((category) => ({
      name: category.name,
      value: category.itemCount,
      color: category.color,
    }))

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Distribution of items across active categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Category Overview</CardTitle>
              <CardDescription>Quick stats about your menu categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-gray-500">Total Categories</div>
                    <div className="mt-1 text-2xl font-bold">{categories.length}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-gray-500">Active Categories</div>
                    <div className="mt-1 text-2xl font-bold">{categories.filter((c) => c.active).length}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-gray-500">Featured Categories</div>
                    <div className="mt-1 text-2xl font-bold">{categories.filter((c) => c.featured).length}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-gray-500">Total Items</div>
                    <div className="mt-1 text-2xl font-bold">
                      {categories.reduce((sum, cat) => sum + cat.itemCount, 0)}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium text-gray-500 mb-2">Category with Most Items</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">
                        {
                          categories.reduce((max, cat) => (cat.itemCount > max.itemCount ? cat : max), categories[0])
                            .name
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {
                          categories.reduce((max, cat) => (cat.itemCount > max.itemCount ? cat : max), categories[0])
                            .itemCount
                        }{" "}
                        items
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Items
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Categories</CardTitle>
                <CardDescription>Manage your menu categories and organization</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Create a new category for organizing your menu items.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input id="name" placeholder="Category name" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Description
                        </Label>
                        <Input id="description" placeholder="Category description" className="col-span-3" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                          Color
                        </Label>
                        <div className="col-span-3 flex gap-2">
                          <Input id="color" type="color" defaultValue="#7d5a3c" className="w-12 p-1 h-9" />
                          <Input defaultValue="#7d5a3c" className="flex-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <div className="col-span-3 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="active" className="rounded border-gray-300" defaultChecked />
                            <Label htmlFor="active">Active</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="featured" className="rounded border-gray-300" />
                            <Label htmlFor="featured">Featured</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsAddDialogOpen(false)}>Save Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("itemCount")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Items
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                          <span className="font-medium">{category.name}</span>
                          {category.featured && (
                            <Badge variant="outline" className="ml-2">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.itemCount} items</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {category.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>View Items</DropdownMenuItem>
                              <DropdownMenuItem>Edit Category</DropdownMenuItem>
                              {category.active ? (
                                <DropdownMenuItem>Deactivate</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>Activate</DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

