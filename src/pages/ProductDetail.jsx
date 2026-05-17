import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Truck, MapPin } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useProductStore from '../store/useProductStore';
import useSettingsStore from '../store/useSettingsStore';
import SizeGuide from '../components/SizeGuide';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getProductById = useProductStore(state => state.getProductById);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const products = useProductStore(state => state.products);
  const isLoading = useProductStore(state => state.isLoading);
  const product = getProductById(id);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const { userZipCode, setUserZipCode } = useCartStore();
  const { shippingCost, localShippingCost, fetchSettings } = useSettingsStore();

  const [zipInput, setZipInput] = useState(userZipCode || '');
  const [calculatedShipping, setCalculatedShipping] = useState(null);
  
  useEffect(() => {
    fetchSettings();
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const handleCalculateShipping = () => {
    if (!zipInput.trim()) return;
    setUserZipCode(zipInput.trim());
    if (zipInput.trim() === '5300') {
      setCalculatedShipping(localShippingCost);
    } else {
      setCalculatedShipping(shippingCost);
    }
  };

  const addItem = useCartStore(state => state.addItem);

  const sizes = product?.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ['Talle Único'];

  const allImages = product ? [product.image_url, ...(product.additional_images || [])] : [];

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentImageIndex(index);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/catalog" className="btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona un talle.");
      return;
    }
    addItem(product, selectedSize);
    navigate('/checkout'); // Redirigir al checkout/carrito inmediatamente para flujo rápido
  };

  return (
    <div className="bg-white min-h-screen py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-brand-red mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver al catálogo
        </Link>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Imágenes */}
          <div className="w-full md:w-1/2 relative group">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory rounded-3xl shadow-sm bg-gray-100 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allImages.map((img, idx) => (
                <div key={idx} className="w-full shrink-0 snap-center relative">
                  <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Flechas (Sólo en Desktop si hay más de 1 imagen) */}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={() => scrollToIndex((currentImageIndex - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => scrollToIndex((currentImageIndex + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Puntos Indicadores */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full">
                {allImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => scrollToIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">{product.brand}</span>
            </div>
            <h1 className="text-4xl font-extrabold font-montserrat text-brand-dark mb-4">{product.name}</h1>
            
            <div className="mb-6 flex flex-col">
              {product.discount > 0 ? (
                <>
                  <div className="flex items-center space-x-4 mb-1">
                    <span className="text-3xl font-extrabold text-brand-red">
                      ${(product.price * (1 - product.discount / 100)).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-sm font-bold text-white bg-brand-red px-3 py-1 rounded-full shadow-sm">
                      {product.discount}% OFF
                    </span>
                  </div>
                  <span className="text-lg text-gray-400 line-through font-semibold">
                    ${product.price.toLocaleString('es-AR')}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-extrabold text-brand-red">${product.price.toLocaleString('es-AR')}</span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Seleccionar Talle</h3>
                <span onClick={() => setIsSizeGuideOpen(true)} className="text-sm text-brand-red hover:underline cursor-pointer font-bold flex items-center">
                  <span className="mr-1">📏</span> Guía de talles
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border-2 font-bold transition-all ${
                      selectedSize === size 
                      ? 'border-brand-dark bg-brand-dark text-white' 
                      : 'border-gray-200 text-gray-600 hover:border-brand-dark hover:text-brand-dark'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculador de Envío */}
            <div className="mb-8 bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Truck className="mr-2 text-blue-600" size={20} /> Calcula tu Envío
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Tu Código Postal (Ej: 5300)" 
                    value={zipInput}
                    onChange={(e) => {
                      setZipInput(e.target.value);
                      setCalculatedShipping(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculateShipping()}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <button 
                  onClick={handleCalculateShipping}
                  className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Calcular
                </button>
              </div>
              
              {calculatedShipping !== null && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 flex justify-between items-center animate-fade-in">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">
                      Envío a {zipInput === '5300' ? 'La Rioja (Capital)' : 'Resto del País'}
                    </span>
                    <span className="text-xs text-gray-500">Recíbelo en tu domicilio o sucursal</span>
                  </div>
                  <span className="font-black text-blue-700 text-lg">
                    ${calculatedShipping.toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md p-4 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:relative md:border-none md:shadow-none md:p-0 md:bg-transparent z-40">
              <button 
                onClick={handleAddToCart}
                className="btn-primary w-full py-4 md:py-5 text-xl flex justify-center items-center h-14 md:h-16 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
              >
                <ShoppingBag size={24} className="mr-3" />
                Agregar al Carrito
              </button>
              <p className="hidden md:block text-center text-sm text-gray-500 mt-4">Pago seguro. Envío inmediato en La Rioja.</p>
            </div>
          </div>
        </div>

      </div>
      
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetail;
