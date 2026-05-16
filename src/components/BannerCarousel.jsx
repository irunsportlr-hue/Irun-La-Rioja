import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BannerCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrar banners válidos (no nulos)
  const validBanners = banners?.filter(Boolean) || [];

  useEffect(() => {
    if (validBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validBanners.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [validBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? validBanners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % validBanners.length);
  };

  // Default estático si no hay banners
  if (validBanners.length === 0) {
    return (
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
    );
  }

  return (
    <section className="relative h-[400px] md:h-[600px] w-full overflow-hidden group bg-gray-900">
      
      {/* Contenedor de las imágenes */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validBanners.map((banner, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <img 
              src={banner} 
              alt={`Publicidad ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            {/* Superposición sutil para que luzca pro */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Botones de navegación (Aparecen en Hover) */}
      {validBanners.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 backdrop-blur-md text-white hover:text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
          >
            <ChevronLeft size={28} />
          </button>
          
          <button 
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/70 backdrop-blur-md text-white hover:text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Indicadores (Puntos) */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                ? "w-8 h-2.5 bg-brand-red" 
                : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}

    </section>
  );
};

export default BannerCarousel;
