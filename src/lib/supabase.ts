import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '@/config/supabase'

/**
 * Supabase client instance for database operations
 * This is the main client used throughout the application
 */
export const supabase = createClient(
  SUPABASE_CONFIG.URL!, 
  SUPABASE_CONFIG.ANON_KEY!
)
