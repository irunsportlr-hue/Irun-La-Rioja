import { create } from 'zustand';

const initialMockProducts = [
  { id: '1', name: 'Nike Air Max 270', price: 145000, category: 'Calzado', brand: 'Nike', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', description: 'Las Nike Air Max 270 ofrecen una amortiguación visible en cada pisada. Diseñadas para el estilo diario que exige confort y ligereza.' },
  { id: '2', name: 'Adidas Ultraboost 22', price: 160000, category: 'Calzado', brand: 'Adidas', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800', description: 'Retorno de energía inagotable gracias a la mediasuela Boost. El upper de Primeknit abraza el pie para un ajuste perfecto.' },
  { id: '3', name: 'Puma RS-X', price: 125000, category: 'Calzado', brand: 'Puma', image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800', description: 'Estilo retro futurista con tecnología de amortiguación RS. Un clásico reinventado.' },
  { id: '4', name: 'Buzo Nike Sportswear', price: 85000, category: 'Ropa', brand: 'Nike', image_url: 'https://images.unsplash.com/photo-1556821840-06110f607119?auto=format&fit=crop&q=80&w=800', description: 'Comodidad clásica con fleece cepillado suave. Perfecto para el día a día o post-entrenamiento.' },
  { id: '5', name: 'Remera Adidas Essentials', price: 35000, category: 'Ropa', brand: 'Adidas', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800', description: 'Tejido de algodón suave con logotipo Badge of Sport en el pecho.' },
  { id: '6', name: 'Gorra Under Armour', price: 25000, category: 'Accesorios', brand: 'Under Armour', image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800', description: 'Tecnología HeatGear que capilariza el sudor. Visera precurvada.' },
];

const useProductStore = create((set, get) => ({
  products: initialMockProducts,
  
  // Función para búsqueda global, predictiva insensible a mayúsculas
  searchProducts: (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    return get().products.filter(product => {
      return (
        product.name.toLowerCase().includes(lowerQuery) || 
        product.brand.toLowerCase().includes(lowerQuery) || 
        product.category.toLowerCase().includes(lowerQuery)
      );
    });
  },

  getProductById: (id) => {
    return get().products.find(p => p.id === String(id));
  }
}));

export default useProductStore;
