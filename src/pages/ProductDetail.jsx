import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useProductStore from '../store/useProductStore';
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
  
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const addItem = useCartStore(state => state.addItem);

  const sizes = product?.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ['Talle Único'];

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
          {/* Imagen */}
          <div className="w-full md:w-1/2">
            <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <img src={product.image_url} alt={product.name} className="w-full h-auto object-cover" />
            </div>
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
