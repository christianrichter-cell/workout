import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SUPABASE_URL = 'https://wgqwmkkmstwklivxguom.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_o_hvYr9hv7I-vPMe7tQ9QQ_7NKwGa-N'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
