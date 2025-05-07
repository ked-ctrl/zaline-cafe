"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { SUPABASE_CONFIG } from "@/config/supabase"
import { STORAGE } from "@/config/constants"
import { MenuItem } from "@/types/menu"
import { getUserSession } from "@/lib/auth"

/**
 * Menu component props
 */
interface MenuProps {
  items: MenuItem[]
  onAddToCart?: (item: MenuItem) => void
  isAdmin?: boolean
  onEdit?: (item: MenuItem) => void
  onDelete?: (item: MenuItem) => void
}

/**
 * Menu component
 * Displays a grid of menu items with options for adding to cart or admin actions
 */
export function Menu({ 
  items, 
  onAddToCart, 
  isAdmin = false, 
  onEdit, 
  onDelete 
}: MenuProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  /**
   * Handle adding an item to the cart
   */
  const handleAddToCart = (item: MenuItem) => {
    // Check if user is logged in
    const userSession = getUserSession()
    if (!userSession) {
      toast.error('Please sign in to add items to cart')
      return
    }

    onAddToCart?.(item)
  }

  return (
    <>
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="rounded-lg border border-amber-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative aspect-square">
            <Image
              src={item.menu_image ? 
                `${SUPABASE_CONFIG.URL}/storage/v1/object/public/${STORAGE.BUCKETS.MENU_IMAGES}/${item.menu_image}`
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
              <p className="text-lg font-bold text-amber-600">₱{item.menu_price.toFixed(2)}</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">{item.menu_category}</p>
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">{item.menu_description}</p>
            <div className="mt-4 flex gap-2">
              {isAdmin ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => onEdit?.(item)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => onDelete?.(item)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.available}
                >
                  {item.available ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}
