import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rnigtfljqgsqucnwuofj.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaWd0ZmxqcWdzcXVjbnd1b2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzA5NzcsImV4cCI6MjA5Njc0Njk3N30.OCCm8tHJ6nbdfAq2JFlXQXE3i4PKrXdUa4NO5U6EY7M'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'drKrithi@2024'
export const ADMIN_PHONE = (import.meta.env.VITE_ADMIN_PHONE || '918987367274').replace(/[^\d]/g, '')
