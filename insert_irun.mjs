import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ccjlpomqlpmnbkulvqrg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjamxwb21xbHBtbmJrdWx2cXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDEyNjMsImV4cCI6MjA5MzY3NzI2M30.2ZQ4qCfFgb1ZepNTc_JzuAkXece2s1Jxe2ICviATcso'
const supabase = createClient(supabaseUrl, supabaseKey)

async function insertProduct() {
  const newProduct = {
    name: 'Zapatillas I-RUN PRO',
    price: 60000,
    category: 'Calzado',
    brand: 'I-RUN',
    description: 'Zapatillas I-RUN PRO ultra livianas y modernas con tecnología de amortiguación avanzada. Especialmente diseñadas para el running de alto rendimiento.',
    image_url: '/gallery/irun_side_1778983933544.png',
    additional_images: [
      '/gallery/irun_top_1778983956107.png',
      '/gallery/irun_front_1778983979643.png',
      '/gallery/irun_back_1778983990457.png'
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    discount: 0
  }

  const { data, error } = await supabase.from('products').insert([newProduct]).select()
  
  if (error) {
    console.error('Error insertando producto:', error)
  } else {
    console.log('Producto insertado correctamente:', data)
  }
}

insertProduct()
