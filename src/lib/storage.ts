import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const uploadImage = async (file: File, bucketName: string = 'menu-images'): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${fileName}`  // Store only the file name

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file)

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    return filePath  // Return only the file path
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}