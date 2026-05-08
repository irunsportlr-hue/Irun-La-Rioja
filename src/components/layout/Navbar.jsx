import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useCartStore from '../../store/useCartStore';
import useProductStore from '../../store/useProductStore';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useCartStore(state => state.getCartCount());
  
  // Lógicas de búsqueda inteligente
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchProducts = useProductStore(state => state.searchProducts);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar el buscador al clickear afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      setSearchResults(searchProducts(query).slice(0, 5)); // Mostrar predictivo act a 5 max
    } else {
      setSearchResults([]);
    }
  };

  const handleProductSelect = (id) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${id}`);
  };

  return (
    <nav className="fixed top-0 w-full bg-white z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold font-montserrat tracking-tight">
              I-RUN <span className="text-brand-red">/</span> LA RIOJA
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
            <Link to="/" className="text-brand-dark font-medium hover:text-brand-red transition-colors">Inicio</Link>
            <Link to="/catalog" className="text-brand-dark font-medium hover:text-brand-red transition-colors">Catálogo</Link>
            <Link to="/about" className="text-brand-dark font-medium hover:text-brand-red transition-colors">Nosotros</Link>
          </div>

          {/* Icons Context & Search */}
          <div className="flex items-center space-x-4">
            
            {/* Buscador Inteligente Desktop/Mobile Oculto */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-brand-red transition-all w-64">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Buscar zapatillas, marcas..." 
                  className="bg-transparent border-none focus:outline-none w-full ml-2 text-sm text-gray-700 placeholder-gray-400 font-medium"
                />
              </div>

              {/* Autocompletado Predictivo Dropdown */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-12 right-0 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sugerencias
                  </div>
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <button 
                            onClick={() => handleProductSelect(product.id)}
                            className="w-full flex items-center px-4 py-3 hover:bg-red-50 hover:text-brand-red transition-colors text-left"
                          >
                            <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                            <div className="ml-3 flex flex-col">
                              <span className="font-bold text-sm text-gray-900 group-hover:text-brand-red">{product.name}</span>
                              <span className="text-xs text-gray-500">{product.brand} - ${product.price.toLocaleString('es-AR')}</span>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-gray-400" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-gray-500 font-medium">No hay resultados para "{searchQuery}"</p>
                      <Link to="/catalog" onClick={() => setIsSearchFocused(false)} className="text-brand-red text-xs font-bold mt-2 inline-block hover:underline">Ver catálogo completo</Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/checkout" className="p-2 text-gray-500 hover:text-brand-red transition-colors relative">
              <ShoppingCart size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-red rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-brand-red transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Buscador Mobile (visible solo en menú) */}
        {isMobileMenuOpen && (
           <div className="sm:hidden px-2 pt-2 pb-4">
             <div className="relative">
              <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3">
                <Search size={20} className="text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Ej: Zapatillas Adidas..." 
                  className="bg-transparent border-none focus:outline-none w-full ml-3 text-sm text-gray-700 font-medium"
                />
              </div>
              
              {searchQuery.trim().length > 0 && (
                <div className="mt-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-gray-50">
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <button 
                            onClick={() => { handleProductSelect(product.id); setIsMobileMenuOpen(false); }}
                            className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-left"
                          >
                            <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="ml-3">
                              <span className="font-bold text-sm block">{product.name}</span>
                              <span className="text-xs text-gray-500">${product.price.toLocaleString('es-AR')}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-gray-500">Sin resultados</div>
                  )}
                </div>
              )}
           </div>
         </div>
        )}
      </div>

      {/* Mobile Menu Nav Links */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="block px-3 py-2 rounded-md text-base font-medium text-brand-dark hover:text-brand-red hover:bg-gray-50">Inicio</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/catalog" className="block px-3 py-2 rounded-md text-base font-medium text-brand-dark hover:text-brand-red hover:bg-gray-50">Catálogo</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-brand-dark hover:text-brand-red hover:bg-gray-50">Nosotros</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
