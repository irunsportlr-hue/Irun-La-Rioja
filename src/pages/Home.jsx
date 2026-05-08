import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShieldCheck, Truck } from 'lucide-react';

import useProductStore from '../store/useProductStore';

const Home = () => {
  const products = useProductStore(state => state.products);
  const homeProducts = products.slice(0, 4);
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-brand-light">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
        <div className="relative h-[600px] flex items-center">
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 font-montserrat tracking-tight leading-tight">
              SUPERA TUS <br/> <span className="text-brand-red">LÍMITES</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-xl font-light">
              La mejor selección de calzado e indumentaria deportiva en La Rioja. Encuentra tu estilo, mejora tu rendimiento.
            </p>
            <Link to="/catalog" className="inline-flex items-center btn-primary text-lg px-8 py-4">
              Ver Catálogo
              <ArrowRight className="ml-2" size={24} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-red-100 text-brand-red rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Marcas Originales</h3>
              <p className="text-gray-600">Trabajamos exclusivamente con productos 100% auténticos y garantizados.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-red-100 text-brand-red rounded-full flex items-center justify-center mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Envíos Rápidos</h3>
              <p className="text-gray-600">Entregas en Capital en el día. Envíos seguros a toda la provincia.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="h-16 w-16 bg-red-100 text-brand-red rounded-full flex items-center justify-center mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Últimas Tendencias</h3>
              <p className="text-gray-600">Las colecciones más recientes de tus marcas deportivas favoritas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Novedades Destacadas */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold font-montserrat tracking-tight text-brand-dark mb-2">Novedades Destacadas</h2>
              <div className="w-20 h-1 bg-brand-red"></div>
            </div>
            <Link to="/catalog" className="hidden sm:flex text-brand-red font-medium hover:text-red-700 items-center">
              Ver todos <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 snap-x snap-mandatory hide-scrollbar">
            {homeProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="snap-start shrink-0 w-[75vw] sm:w-auto group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 sm:border-transparent">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                    {product.brand}
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <span className="text-sm text-gray-500 mb-1">{product.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-brand-red transition-colors line-clamp-2">{product.name}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-xl font-black text-brand-dark">${product.price.toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 sm:hidden flex justify-center">
            <Link to="/catalog" className="btn-outline w-full text-center">Ver todos los productos</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
