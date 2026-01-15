import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://jhguzrsppjvdtbzbuiha.supabase.co', 'sb_publishable_f41z4p6CqtLvrpIf9B6KYw_HckQdvaA')