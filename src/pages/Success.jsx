import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'Desconocido';

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center transform transition-all">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-montserrat tracking-tight">
          ¡Pago Exitoso!
        </h2>
        
        <p className="text-gray-500 mb-6 text-sm">
          Tu compra ha sido procesada correctamente mediante Mercado Pago / Tarjeta.
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-center items-center text-gray-400 mb-2">
            <Package size={24} className="mr-2" />
            <span className="font-semibold text-gray-700">Orden de Compra</span>
          </div>
          <span className="text-2xl font-black text-brand-dark tracking-widest">
            #{orderId}
          </span>
          <p className="text-xs text-gray-400 mt-3">
            Guarda este número para seguimiento. Te enviaremos actualizaciones a tu teléfono.
          </p>
        </div>

        <Link to="/catalog" className="w-full inline-flex justify-center py-4 px-4 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-brand-red hover:bg-red-700 focus:outline-none transition-colors">
          Seguir Comprando
        </Link>
      </div>
    </div>
  );
};

export default Success;
