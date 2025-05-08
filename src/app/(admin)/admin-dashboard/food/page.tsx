// components/FoodItemsPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Coffee, Grid3X3, List, Loader } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { uploadImage } from "@/lib/storage";
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Add proper type definitions
interface MenuItem {
  id: string;
  menu_name: string;
  menu_description: string;
  menu_price: number;
  menu_category: string;
  menu_image: string;
  available: boolean;
  featured: boolean;
  stock: number;
}

interface NewItem {
  menu_name: string;
  menu_description: string;
  menu_price: string;
  menu_category: string;
  menu_image: string;
  available: boolean;
  featured: boolean;
  stock: number;
}

export default function FoodItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [foodItems, setFoodItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState<NewItem>({
    menu_name: "",
    menu_description: "",
    menu_price: "",
    menu_category: "",
    menu_image: "",
    available: true,
    featured: false,
    stock: 100,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);

    // Define fetchMenuItems unconditionally
    const fetchMenuItems = useCallback(async () => {
      try {
        setLoading(true);
  
        // Fetch menu items
        const { data: menuItems, error } = await supabase
          .from("menu")
          .select("*")
          .order("menu_name");
  
        if (error) {
          throw error;
        }
  
        setFoodItems(menuItems as MenuItem[]);
  
        // Extract unique categories
        const uniqueCategories = [...new Set(menuItems.map((item) => item.menu_category))];
        setCategories(uniqueCategories);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching menu items:", error.message);
          toast.error("Failed to load menu items. Please try again.");
        } else {
          console.error("Unknown error:", error);
          toast.error("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }, []);
  
    // Fetch menu items and categories from Supabase
    useEffect(() => {
      fetchMenuItems();
    }, [fetchMenuItems]);

  useEffect(() => {
    const adminSession = Cookies.get("admin-session")
    if (!adminSession) {
      router.push("/admin-login")
      return
    }

    const adminData = JSON.parse(adminSession)
    setAdmin(adminData)
  }, [router])

  if (!admin) {
    return <div>Loading...</div>
  }



  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];

      if (!file) return;

      // Upload the image using the utility function
      const imageUrl = await uploadImage(file);

      // Update form state with the image URL
      setNewItem({
        ...newItem,
        menu_image: imageUrl,
      });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error uploading image:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleAddItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("menu")
        .insert([
          {
            ...newItem,
            menu_price: parseFloat(newItem.menu_price),
            stock: parseInt(newItem.stock.toString(), 10),
          },
        ])
        .select();

      if (error) throw error;

      setFoodItems([data[0] as MenuItem, ...foodItems]);
      setIsAddDialogOpen(false);
      toast.success("Menu item added successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding menu item:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle price change
  const handlePriceChange = (value: string) => {
    setNewItem((prev) => ({
      ...prev,
      menu_price: value,
    }));
  };

  // Handle stock change
  const handleStockChange = (value: string) => {
    setNewItem((prev) => ({
      ...prev,
      stock: parseInt(value, 10) || 0,
    }));
  };

  // Handle delete item
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("menu").delete().eq("id", id);

      if (error) {
        throw error;
      }

      // Refresh menu items
      fetchMenuItems();

      toast.success("Menu item deleted successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting menu item:", error.message);
        toast.error(error.message);
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred");
      }
    }
  };

  // Animation variants
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

  // Filter food items based on search term and category
  const filteredItems = foodItems.filter((item) => {
    const matchesSearch =
      item.menu_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.menu_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.menu_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Food Items</CardTitle>
                <CardDescription>Manage your menu items, prices, and availability</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none rounded-l-md"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-none rounded-r-md"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Add New Item</DialogTitle>
                      <DialogDescription>Create a new food or beverage item for your menu.</DialogDescription>
                    </DialogHeader>
                    <form id="add-item-form" onSubmit={handleAddItem}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name*
                          </Label>
                          <Input
                            id="name"
                            className="col-span-3"
                            value={newItem.menu_name}
                            onChange={(e) => setNewItem({ ...newItem, menu_name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Input
                            id="description"
                            className="col-span-3"
                            value={newItem.menu_description}
                            onChange={(e) => setNewItem({ ...newItem, menu_description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">
                            Price
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newItem.menu_price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category*
                          </Label>
                          <Select
                            value={newItem.menu_category}
                            onValueChange={(value) => setNewItem({ ...newItem, menu_category: value })}
                          >
                            <SelectTrigger id="category" className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="new">+ Add New Category</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {newItem.menu_category === "new" && (
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newCategory" className="text-right">
                              New Category*
                            </Label>
                            <Input
                              id="newCategory"
                              className="col-span-3"
                              onChange={(e) => setNewItem({ ...newItem, menu_category: e.target.value })}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="stock" className="text-right">
                            Stock
                          </Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newItem.stock.toString()}
                            onChange={(e) => handleStockChange(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="image" className="text-right">
                            Image
                          </Label>
                          <div className="col-span-3 flex gap-2 items-center">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                            />
                            {isUploading && <Loader className="animate-spin h-4 w-4" />}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="available" className="text-right">
                            Available
                          </Label>
                          <div className="flex items-center space-x-2 col-span-3">
                            <Switch
                              id="available"
                              checked={newItem.available}
                              onCheckedChange={(checked) => setNewItem({ ...newItem, available: checked })}
                            />
                            <Label htmlFor="available">Item is available for purchase</Label>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="featured" className="text-right">
                            Featured
                          </Label>
                          <div className="flex items-center space-x-2 col-span-3">
                            <Switch
                              id="featured"
                              checked={newItem.featured}
                              onCheckedChange={(checked) => setNewItem({ ...newItem, featured: checked })}
                            />
                            <Label htmlFor="featured">Show as featured item</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" form="add-item-form" disabled={isSubmitting}>
                          {isSubmitting ? <Loader className="animate-spin h-4 w-4" /> : "Save Item"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading menu items...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No menu items found. Add some items to get started!</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="rounded-lg border border-amber-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={item.menu_image ? 
                          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${item.menu_image}`
                          : "/images/placeholder-food.png"
                        }
                        alt={item.menu_name}
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {item.featured && <Badge className="bg-amber-600 hover:bg-amber-700">Featured</Badge>}
                        {!item.available && <Badge className="bg-gray-900 hover:bg-gray-800">Out of Stock</Badge>}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">{item.menu_name}</h3>
                        <p className="text-lg font-bold text-amber-600">${item.menu_price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{item.menu_category}</p>
                      <p className="text-sm mt-2 text-gray-600 line-clamp-2">{item.menu_description}</p>
                      <div className="mt-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700">
                              Manage Item
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Coffee className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left align-middle font-medium">Image</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Category</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Price</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Stock</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-10 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <motion.tr key={item.id} variants={itemVariants} className="border-b">
                        <td className="p-4">
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
<Image
  src={item.menu_image ? 
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/menu-images/${item.menu_image}`
    : "/images/placeholder-food.png"
  }
  alt={item.menu_name}
  width={200}
  height={200}
  className="object-cover"
  unoptimized={true}
/>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div>
                            <p className="font-medium">{item.menu_name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{item.menu_description}</p>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{item.menu_category}</td>
                        <td className="p-4 align-middle font-medium">${item.menu_price.toFixed(2)}</td>
                        <td className="p-4 align-middle">{item.stock}</td>
                        <td className="p-4 align-middle">
                          <Badge variant={item.available ? "outline" : "destructive"}>
                            {item.available ? "Available" : "Out of Stock"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
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
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Coffee className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredItems.length} of {foodItems.length} items
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={filteredItems.length === foodItems.length}>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}