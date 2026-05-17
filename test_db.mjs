import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccjlpomqlpmnbkulvqrg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamxwb21xbHBtbmJrdWx2cXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDEyNjMsImV4cCI6MjA5MzY3NzI2M30.2ZQ4qCfFgb1ZepNTc_JzuAkXece2s1Jxe2ICviATcso'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing products columns...')
  const { data: p, error: pe } = await supabase.from('products').select('*').limit(1)
  if (pe) console.error('products err:', pe)
  else console.log('products first row:', p)

  console.log('Testing settings table...')
  const { data: s, error: se } = await supabase.from('settings').select('*').limit(1)
  if (se) console.error('settings err:', se.message)
  else console.log('settings first row:', s)
}

test()
