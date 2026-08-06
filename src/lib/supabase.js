import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://scihrslohphuakyczrkv.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaWhyc2xvaHBodWFreWN6cmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTY1NjAsImV4cCI6MjEwMDAzMjU2MH0.v3sAY8Gm6N94h1MdzQabHevm7Fy8COEKLgUsX74LKBs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'UshaDental@2026'
export const ADMIN_PHONE = (import.meta.env.VITE_ADMIN_PHONE || '918987367274').replace(/[^\d]/g, '')
