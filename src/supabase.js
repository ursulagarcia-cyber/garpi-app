import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qezlbmcedpsugxardtio.supabase.co'
const supabaseKey = 'sb_publishable_H2m241mr_wNpZrw-u5I5_A_E0dZIcto'

export const supabase = createClient(supabaseUrl, supabaseKey)