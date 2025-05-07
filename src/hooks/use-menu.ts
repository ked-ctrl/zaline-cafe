import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { TABLES } from '@/config/supabase'
import { MenuItem } from '@/types/menu'
import { uploadImage } from '@/lib/storage'

/**
 * Menu filter options
 */
export interface MenuFilters {
  category?: string
  available?: boolean
  featured?: boolean
  search?: string
}

/**
 * Custom hook for menu operations
 */
export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  /**
   * Fetch all menu items
   */
  const fetchMenuItems = async (filters?: MenuFilters): Promise<void> => {
    try {
      setLoading(true)

      let query = supabase
        .from(TABLES.MENU)
        .select('*')
        .order('menu_category')
        .order('menu_name')

      // Apply filters if provided
      if (filters) {
        if (filters.category) {
          query = query.eq('menu_category', filters.category)
        }
        
        if (filters.available !== undefined) {
          query = query.eq('available', filters.available)
        }
        
        if (filters.featured !== undefined) {
          query = query.eq('featured', filters.featured)
        }
        
        if (filters.search) {
          query = query.ilike('menu_name', `%${filters.search}%`)
        }
      }

      const { data, error } = await query

      if (error) throw error

      setMenuItems(data as MenuItem[])
      
      // Extract unique categories
      if (data) {
        const uniqueCategories = [...new Set(data.map(item => item.menu_category))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add a new menu item
   */
  const addMenuItem = async (item: Omit<MenuItem, 'id'>, imageFile?: File): Promise<boolean> => {
    try {
      let imagePath = ''
      
      // Upload image if provided
      if (imageFile) {
        imagePath = await uploadImage(imageFile)
      }
      
      const newItem = {
        ...item,
        menu_image: imagePath || item.menu_image
      }
      
      const { error } = await supabase
        .from(TABLES.MENU)
        .insert(newItem)
      
      if (error) throw error
      
      toast.success('Menu item added successfully')
      await fetchMenuItems()
      return true
    } catch (error) {
      console.error('Error adding menu item:', error)
      toast.error('Failed to add menu item')
      return false
    }
  }

  /**
   * Update an existing menu item
   */
  const updateMenuItem = async (
    id: string, 
    updates: Partial<MenuItem>, 
    imageFile?: File
  ): Promise<boolean> => {
    try {
      let updatedData = { ...updates }
      
      // Upload new image if provided
      if (imageFile) {
        const imagePath = await uploadImage(imageFile)
        updatedData.menu_image = imagePath
      }
      
      const { error } = await supabase
        .from(TABLES.MENU)
        .update(updatedData)
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Menu item updated successfully')
      await fetchMenuItems()
      return true
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast.error('Failed to update menu item')
      return false
    }
  }

  /**
   * Delete a menu item
   */
  const deleteMenuItem = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.MENU)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Menu item deleted successfully')
      await fetchMenuItems()
      return true
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast.error('Failed to delete menu item')
      return false
    }
  }

  /**
   * Toggle the availability of a menu item
   */
  const toggleAvailability = async (id: string, available: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.MENU)
        .update({ available })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(`Item ${available ? 'available' : 'unavailable'}`)
      await fetchMenuItems()
      return true
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Failed to update availability')
      return false
    }
  }

  /**
   * Toggle the featured status of a menu item
   */
  const toggleFeatured = async (id: string, featured: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from(TABLES.MENU)
        .update({ featured })
        .eq('id', id)
      
      if (error) throw error
      
      toast.success(`Item ${featured ? 'featured' : 'unfeatured'}`)
      await fetchMenuItems()
      return true
    } catch (error) {
      console.error('Error toggling featured status:', error)
      toast.error('Failed to update featured status')
      return false
    }
  }

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenuItems()
  }, [])

  return {
    menuItems,
    loading,
    categories,
    fetchMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleFeatured
  }
}