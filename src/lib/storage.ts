import { supabase } from '@/lib/supabase'
import { STORAGE } from '@/config/constants'

/**
 * Upload an image to Supabase storage
 * 
 * @param file - The file to upload
 * @param bucketName - The storage bucket name (defaults to menu-images)
 * @returns The file path of the uploaded image
 */
export const uploadImage = async (
  file: File, 
  bucketName: string = STORAGE.BUCKETS.MENU_IMAGES
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    return filePath
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}
