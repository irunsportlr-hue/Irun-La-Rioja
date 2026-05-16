import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Smartphone, CreditCard, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useOrderStore from '../store/useOrderStore';
import useSettingsStore from '../store/useSettingsStore';
import { supabase } from '../lib/supabaseClient';
import { initMercadoPago } from '@mercadopago/sdk-react';


initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY || '', { locale: 'es-AR' });

const Checkout = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const addOrder = useOrderStore(state => state.addOrder);
  const { shippingCost, localShippingCost, fetchSettings } = useSettingsStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago'); // mercadopago | tarjeta

  // Fetch settings on load
  useState(() => {
    fetchSettings();
  }, []);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    barrio: '',
    codigoPostal: '',
    ubicacionUrl: '',
  });

  const subtotal = getCartTotal();
  const whatsappNumber = '5493804120296'; // Número de Muruchi SAUL saul;
  
  const isLocalShipping = formData.codigoPostal === '5300';
  const envio = isLocalShipping ? (localShippingCost || 0) : (shippingCost || 0);
  const total = subtotal + envio;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);

    try {
      // 1. Guardar orden en Supabase
      const orderData = {
        customer_name: formData.nombre,
        customer_phone: formData.telefono,
        customer_address: formData.direccion,
        customer_neighborhood: formData.barrio,
        location_url: formData.ubicacionUrl,
        total_amount: total,
        status: 'pending',
        payment_method: paymentMethod
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Guardar items de la orden
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id || item.product.name,
        product_name: item.product.name,
        quantity: item.quantity,
        size: item.size || '-',
        price_at_time: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Crear preferencia en Mercado Pago usando Edge Function
      if (paymentMethod === 'mercadopago') {
        const { data: preferenceData, error: prefError } = await supabase.functions.invoke('create-preference', {
          body: { orderId: order.id, items: items, customer: formData, returnUrl: window.location.origin, shippingCost: envio }
        });

        if (prefError) throw prefError;

        // Redirect immediately to Mercado Pago Checkout Pro
        window.location.href = preferenceData.init_point;
      } else {
        // Otros métodos de pago
        clearCart();
        navigate('/success', { state: { orderId: order.id } });
      }

    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Ocurrió un error al procesar tu pedido. Por favor intenta de nuevo.");
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="bg-gray-50 flex flex-col items-center justify-center min-h-[60vh] py-12">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 font-montserrat">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8">Parece que aún no has agregado productos. ¡Explora nuestro catálogo y empieza tu compra!</p>
          <Link to="/catalog" className="btn-primary w-full inline-block">Explorar Productos</Link>
        </div>
      </div>
    );
  }

  // Pantalla de procesamiento
  if (isProcessing) {
    return (
      <div className="bg-gray-50 flex flex-col items-center justify-center min-h-[70vh] py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-red mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Procesando Pago...</h2>
          <p className="text-gray-500">Conectando con {paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'tu Tarjeta'}, por favor espera.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold font-montserrat text-brand-dark mb-8">Finalizar Compra</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Detalles de Envío y Pago */}
          <div className="w-full lg:w-3/5 space-y-6">
            
            {/* Resumen Productos (Breve) */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">Tus Productos</h2>
                <Link to="/catalog" className="text-sm font-semibold text-brand-red border border-brand-red px-4 py-2 rounded-full hover:bg-red-50">Modificar</Link>
              </div>
              <div className="p-6">
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={`${item.product.id}-${item.size}`} className="py-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                        <div className="ml-4">
                          <h3 className="font-bold text-gray-900">{item.product.name}</h3>
                          <p className="text-gray-500 text-sm">Talle: {item.size} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-extrabold text-brand-dark">${(item.product.price * item.quantity).toLocaleString('es-AR')}</p>
                        <button 
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar producto"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Formulario */}
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-900 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <MapPin className="mr-2" size={20} /> Datos de Entrega
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                    <input required name="nombre" value={formData.nombre} onChange={handleInputChange} type="text" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                    <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="correo@ejemplo.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                    <input required name="telefono" value={formData.telefono} onChange={handleInputChange} type="tel" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Ej. 3804123456" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Exacta</label>
                    <input required name="direccion" value={formData.direccion} onChange={handleInputChange} type="text" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Av. Principal 1234" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Barrio</label>
                      <input required name="barrio" value={formData.barrio} onChange={handleInputChange} type="text" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Centro" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">C.P.</label>
                      <input required name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} type="text" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Ej: 5300" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Link de Ubicación (Google Maps)</label>
                  <input name="ubicacionUrl" value={formData.ubicacionUrl} onChange={handleInputChange} type="text" className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" placeholder="Pega aquí el link de Maps para encontrar más fácil" />
                  <p className="text-xs text-gray-500 mt-1">Opcional pero recomendado para Motoenvíos rápidos.</p>
                </div>
              </div>
            </form>

            {/* Metodo de pago */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-900 text-white">
                <h2 className="text-xl font-bold flex items-center">
                  <CreditCard className="mr-2" size={20} /> Método de Pago
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* MP */}
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="mercadopago" checked={paymentMethod === 'mercadopago'} onChange={() => setPaymentMethod('mercadopago')} className="sr-only" />
                    {paymentMethod === 'mercadopago' && <CheckCircle2 className="text-blue-500 absolute top-4 right-4" size={20} />}
                    <Smartphone size={32} className="text-blue-500 mb-2" />
                    <span className="font-bold text-gray-900">Mercado Pago</span>
                    <span className="text-sm text-gray-500">Dinero o Cuotas</span>
                  </label>

                  {/* Tarjeta */}
                  <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all ${paymentMethod === 'tarjeta' ? 'border-brand-dark bg-gray-100' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="tarjeta" checked={paymentMethod === 'tarjeta'} onChange={() => setPaymentMethod('tarjeta')} className="sr-only" />
                    {paymentMethod === 'tarjeta' && <CheckCircle2 className="text-brand-dark absolute top-4 right-4" size={20} />}
                    <CreditCard size={32} className="text-brand-dark mb-2" />
                    <span className="font-bold text-gray-900">Tarjeta de Crédito</span>
                    <span className="text-sm text-gray-500">Mastercard, Visa</span>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Checkout Info Sticky */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white rounded-3xl shadow-sm p-8 sticky top-24 border-2 border-transparent hover:border-gray-100 transition-colors">
              <h2 className="text-2xl font-bold mb-6 border-b pb-4">Resumen de Pago</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío {isLocalShipping && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1">Local 5300</span>}</span>
                  {envio > 0 ? (
                    <span className="font-semibold text-gray-800">${envio.toLocaleString('es-AR')}</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Gratis</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-brand-dark pt-6 border-t mt-6">
                  <span>Total</span>
                  <span>${total.toLocaleString('es-AR')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  form="checkout-form"
                  className={`w-full py-5 text-white font-bold rounded-xl text-xl flex items-center justify-center transition-all shadow-lg shadow-black/20 hover:-translate-y-1 ${paymentMethod === 'mercadopago' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' : 'bg-brand-dark hover:bg-black shadow-gray-900/30'}`}
                >
                  Pagar ${total.toLocaleString('es-AR')}
                </button>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg text-xs text-gray-500 flex items-start">
                  <CheckCircle2 className="text-green-500 mr-2 shrink-0" size={16} />
                  <span>Estás en un entorno seguro y encriptado. Pago procesado y protegido por pasarela oficial.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
