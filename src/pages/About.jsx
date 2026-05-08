import { Clock, MapPin, Calendar, Info, Map } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold font-montserrat text-brand-dark mb-6 tracking-tight">
            Sobre Nosotros
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Bienvenidos a <span className="font-bold text-brand-red">I-RUN / La Rioja</span>. 
            Nos dedicamos a traerte la mejor selección de calzado e indumentaria deportiva. 
            Trabajamos con atención personalizada para asegurarnos de que encuentres exactamente lo que necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Info Card */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 opacity-50"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-brand-dark text-white p-3 rounded-xl mr-4">
                    <Calendar size={24} />
                  </div>
                  <h2 className="text-2xl font-bold font-montserrat text-brand-dark">Atención y Horarios</h2>
                </div>

                <div className="mb-6 inline-flex items-center bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm">
                  <Info size={16} className="mr-2" />
                  Atención solo con cita previa
                </div>

                <ul className="space-y-3">
                  <li className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-medium text-gray-700">Lunes</span>
                    <span className="font-bold text-gray-900">10:30 - 23:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-medium text-gray-700">Martes</span>
                    <span className="font-bold text-gray-900">10:30 - 23:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-50 bg-red-50 -mx-4 px-4 rounded-lg">
                    <span className="font-medium text-brand-red">Miércoles</span>
                    <span className="font-bold text-brand-red">09:00 - 23:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-medium text-gray-700">Jueves</span>
                    <span className="font-bold text-gray-900">10:30 - 23:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="font-medium text-gray-700">Viernes</span>
                    <span className="font-bold text-gray-900">10:30 - 23:00</span>
                  </li>
                  <li className="flex justify-between items-center py-2 text-gray-400">
                    <span className="font-medium">Sábado</span>
                    <span className="font-bold">Cerrado</span>
                  </li>
                  <li className="flex justify-between items-center py-2 text-gray-400">
                    <span className="font-medium">Domingo</span>
                    <span className="font-bold">Cerrado</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Location Text Details */}
            <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-start">
                <MapPin size={32} className="text-brand-red shrink-0 mr-4 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 font-montserrat">Nuestra Ubicación</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    La Rioja Capital.<br />
                    Para brindarte la mejor experiencia, te pedimos que coordines tu visita previamente.
                  </p>
                  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <p className="font-semibold text-brand-red flex items-center">
                      <Map size={18} className="mr-2" />
                      Detalle del local:
                    </p>
                    <p className="mt-1 font-medium">"Es una esquina, tiene 1 piso"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Column */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col relative group">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center z-10 bg-white">
              <h2 className="text-xl font-bold font-montserrat text-brand-dark">Mapa de la Zona</h2>
              <a 
                href="https://www.google.com/maps/search/Es+una+esquina,+tiene+1+piso/@-29.4589,-66.8694,17z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-bold text-brand-red hover:underline"
              >
                Abrir en Maps
              </a>
            </div>
            
            <div className="flex-1 w-full bg-gray-200 relative">
              <iframe 
                src="https://maps.google.com/maps?q=-29.4589,-66.8694&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
                title="Ubicación de I-RUN"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;
