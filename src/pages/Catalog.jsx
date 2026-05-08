import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';

import useProductStore from '../store/useProductStore';

const categories = ['Todos', 'Calzado', 'Ropa', 'Accesorios'];
const brands = ['Todas', 'Nike', 'Adidas', 'Puma', 'Under Armour'];

const Catalog = () => {
  const products = useProductStore(state => state.products);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeBrand, setActiveBrand] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchBrand = activeBrand === 'Todas' || p.brand === activeBrand;
    return matchCategory && matchBrand;
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b pb-6">
          <div>
            <h1 className="text-4xl font-extrabold font-montserrat text-brand-dark mb-2">Catálogo</h1>
            <p className="text-gray-500">Encuentra los mejores productos para potenciar tu rendimiento.</p>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 md:mt-0 md:hidden flex items-center justify-center btn-outline w-full"
          >
            <Filter size={20} className="mr-2" />
            Filtrar
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Filtros */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8 sticky top-24">
              
              <div>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Categorías</h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${activeCategory === cat ? 'bg-red-50 text-brand-red font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Marcas</h3>
                <ul className="space-y-2">
                  {brands.map(brand => (
                    <li key={brand}>
                      <button 
                        onClick={() => setActiveBrand(brand)}
                        className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${activeBrand === brand ? 'bg-red-50 text-brand-red font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {brand}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Grilla de Productos */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 sm:border-transparent">
                  <div className="relative h-48 sm:h-64 overflow-hidden bg-gray-100">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-gray-800">
                      {product.brand}
                    </div>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-brand-red transition-colors line-clamp-2">{product.name}</h3>
                    <span className="text-[10px] sm:text-xs text-gray-500 block mb-2 sm:mb-4">{product.category}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-black text-brand-dark">${product.price.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">Intenta con otros filtros o categorías.</p>
                <button onClick={() => { setActiveBrand('Todas'); setActiveCategory('Todos'); }} className="mt-4 text-brand-red font-semibold hover:underline">Limpiar filtros</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Catalog;
