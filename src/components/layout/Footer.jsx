import { MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          <div>
            <h3 className="text-2xl font-bold font-montserrat mb-4">
              I-RUN <span className="text-brand-red">/</span> LA RIOJA
            </h3>
            <p className="text-gray-400 mb-4 max-w-sm">
              Tu tienda de zapatillas e indumentaria deportiva en La Rioja. Calidad, estilo y las mejores marcas para rendir al máximo.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="text-gray-400 hover:text-brand-red transition-colors">Catálogo de Productos</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-brand-red transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/checkout" className="text-gray-400 hover:text-brand-red transition-colors">Mi Carrito</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <MapPin size={20} className="mr-2 text-brand-red" />
                La Rioja, Capital
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-brand-red mr-3" />
                +54 9 3832 41-2995
              </li>
              <li className="flex items-center space-x-4 mt-4">
                <a href="https://www.instagram.com/irun.sport.lr?igsh=MWh3d295eHl3dWxzbA%3D%3D&utm_source=qr" target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-full text-white hover:bg-brand-red transition-colors w-10 h-10 flex items-center justify-center font-bold text-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.whatsapp.com/catalog/5493832412995/?app_absent=0" target="_blank" rel="noreferrer" className="p-2 bg-gray-800 rounded-full text-white hover:bg-brand-red transition-colors w-10 h-10 flex items-center justify-center font-bold text-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} I-RUN / La Rioja. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
