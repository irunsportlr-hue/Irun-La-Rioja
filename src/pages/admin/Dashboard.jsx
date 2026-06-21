import { useState, useEffect } from 'react';
import { Package, DollarSign, LogOut, Plus, Edit2, Trash2, MapPin, CheckCircle, Clock, Truck, Home, Search, X, Menu, Upload, Settings, Save } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore';
import useProductStore from '../../store/useProductStore';
import useSettingsStore from '../../store/useSettingsStore';
import { supabase } from '../../lib/supabaseClient';
import emailjs from '@emailjs/browser';

const SIZES_OPTIONS = {
  'Calzado': ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
  'Ropa (Letras)': ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'],
  'Ropa (Números)': ['1', '2', '3', '4', '5', '6', '7', '8'],
  'Niños': ['0', '2', '4', '6', '8', '10', '12', '14', '16'],
  'Único': ['Talle Único']
};

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('ventas');
  
  // Settings
  const { shippingCost, localShippingCost, mpDiscount, banners, fetchSettings, updateShippingCost, updateLocalShippingCost, updateMpDiscount, updateBanners } = useSettingsStore();
  const [newShippingCostInput, setNewShippingCostInput] = useState('');
  const [newLocalShippingCostInput, setNewLocalShippingCostInput] = useState('');
  const [newMpDiscountInput, setNewMpDiscountInput] = useState('');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Órdenes
  const { orders, updateOrderStatus, fetchOrders } = useOrderStore();
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Catálogo
  const products = useProductStore(state => state.products);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const isLoading = useProductStore(state => state.isLoading);
  const addProduct = useProductStore(state => state.addProduct);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const searchProducts = useProductStore(state => state.searchProducts);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchSettings().then(() => {
        setNewShippingCostInput(useSettingsStore.getState().shippingCost);
        setNewLocalShippingCostInput(useSettingsStore.getState().localShippingCost);
        setNewMpDiscountInput(useSettingsStore.getState().mpDiscount);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (shippingCost !== undefined) {
      setNewShippingCostInput(shippingCost);
    }
    if (localShippingCost !== undefined) {
      setNewLocalShippingCostInput(localShippingCost);
    }
  }, [shippingCost, localShippingCost]);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', discount: 0, category: 'Calzado', brand: '', image_url: '', description: '', sizes: [], colors: [], additional_images: [] });
  const [selectedSizeCategory, setSelectedSizeCategory] = useState('Calzado');
  const [colorInput, setColorInput] = useState('');
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenModal = (product = null) => {
    setUploadError('');
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, discount: product.discount || 0, sizes: product.sizes || [], colors: product.colors || [], additional_images: product.additional_images || [] });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', discount: 0, category: 'Calzado', brand: '', image_url: '', description: '', sizes: [], colors: [], additional_images: [] });
    }
    setIsProductModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setUploadError('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError('');
      
      // Límite de 10MB (para fotos de iPhone de alta calidad)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('La imagen es muy pesada. El límite es 10MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: supabaseError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { upsert: false });

      if (supabaseError) {
        if (supabaseError.message.includes('bucket')) {
           throw new Error('El bucket "products" no existe en tu Supabase.');
        }
        throw supabaseError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setProductForm({ ...productForm, image_url: publicUrlData.publicUrl });
    } catch (error) {
      console.error('Error al subir:', error);
      setUploadError(error.message || 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadError('');
      
      const newUrls = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) continue; // skip heavy files
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: supabaseError } = await supabase.storage.from('products').upload(filePath, file, { upsert: false });
        if (supabaseError) throw supabaseError;
        
        const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filePath);
        newUrls.push(publicUrlData.publicUrl);
      }

      setProductForm(prev => ({ 
        ...prev, 
        additional_images: [...(prev.additional_images || []), ...newUrls] 
      }));
    } catch (error) {
      console.error('Error al subir adicionales:', error);
      setUploadError('Error al subir imagen(es) adicional(es): ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAdditionalImage = (index) => {
    setProductForm(prev => {
      const newImages = [...(prev.additional_images || [])];
      newImages.splice(index, 1);
      return { ...prev, additional_images: newImages };
    });
  };

  const toggleSize = (size) => {
    setProductForm(prev => {
      const sizes = prev.sizes || [];
      if (sizes.includes(size)) {
        return { ...prev, sizes: sizes.filter(s => s !== size) };
      } else {
        return { ...prev, sizes: [...sizes, size] };
      }
    });
  };

  const handleBannerUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      if (file.size > 10 * 1024 * 1024) throw new Error('La imagen es muy pesada. Máximo 10MB.');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}_${index}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: supabaseError } = await supabase.storage.from('products').upload(filePath, file);
      if (supabaseError) throw supabaseError;

      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(filePath);
      
      const newBanners = [...banners];
      // Si el index es mayor a la longitud actual, se añade al final
      if (index >= newBanners.length) {
         newBanners.push(publicUrlData.publicUrl);
      } else {
         newBanners[index] = publicUrlData.publicUrl;
      }
      await updateBanners(newBanners);
    } catch (error) {
      console.error('Error al subir banner:', error);
      alert(error.message || 'Error al subir la imagen.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const removeBanner = async (index) => {
    if (!window.confirm('¿Seguro que deseas eliminar este banner?')) return;
    const newBanners = [...banners];
    newBanners.splice(index, 1);
    await updateBanners(newBanners);
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const formattedProduct = {
      ...productForm,
      price: Number(productForm.price),
      discount: Number(productForm.discount) || 0
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, formattedProduct);
    } else {
      addProduct(formattedProduct);
    }
    handleCloseModal();
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  // Lógica Filtrado de Órdenes
  const filteredOrders = orders.filter(order => {
    if (!orderSearchQuery) return true;
    const q = orderSearchQuery.toLowerCase();
    const isId = (order.id || '').toLowerCase().includes(q);
    const isName = (order.customer?.nombre || '').toLowerCase().includes(q);
    const isBarrio = (order.customer?.barrio || '').toLowerCase().includes(q);
    // Podemos buscar por nombre de cliente, barrio, O el ID de la orden
    return isId || isName || isBarrio;
  });

  // Lógica Filtrado de Productos
  const filteredProducts = productSearchQuery.trim().length > 0 
    ? searchProducts(productSearchQuery) 
    : products;

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    if (newStatus === 'Pago Confirmado') {
      const order = orders.find(o => o.id === orderId || o.full_id === orderId);
      if (order && order.customer && order.customer.email) {
        const SERVICE_ID = 'service_lmqfg7g';
        const TEMPLATE_ID = 'template_rb7eui8'; 
        const PUBLIC_KEY = '47WlpxK81axM_OjLd';

        emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          to_name: order.customer.nombre,
          to_email: order.customer.email,
          order_id: order.id,
          status_msg: 'Pago Confirmado. Ya estamos preparando tu paquete.',
          reply_to: 'contacto@tu-tienda.com'
        }, PUBLIC_KEY)
        .then((result) => {
            console.log('Correo enviado con EmailJS:', result.text);
        }, (error) => {
            console.error('Error enviando correo con EmailJS:', error.text);
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return 'bg-orange-100 text-orange-800';
      case 'Pago Confirmado': return 'bg-blue-100 text-blue-800';
      case 'Preparando': return 'bg-yellow-100 text-yellow-800';
      case 'En Camino': return 'bg-purple-100 text-purple-800';
      case 'Entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'AdminPRO' && password === '$Saulindumentaria%') {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl">
          <div>
            <h2 className="text-center text-3xl font-extrabold font-montserrat text-gray-900">
              I-RUN <span className="text-brand-red">/</span> ADMIN
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Usuario</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="Usuario administrador"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-red-500 text-sm text-center font-semibold">Credenciales incorrectas.</p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-dark hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition-colors"
              >
                Ingresar al Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center z-20 shadow-md">
        <h2 className="text-xl font-bold font-montserrat tracking-tight">
          I-RUN <span className="text-brand-red">/</span> ADMIN
        </h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none p-1">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col absolute md:relative w-full md:w-64 h-[calc(100vh-60px)] md:h-screen bg-gray-900 text-white pt-2 md:pt-6 z-10 transition-all shrink-0 overflow-y-auto`}>
        <div className="hidden md:block px-6 mb-8">
          <h2 className="text-2xl font-bold font-montserrat text-white tracking-tight">
            I-RUN <span className="text-brand-red">/</span> ADMIN
          </h2>
          <p className="text-gray-400 text-sm mt-1">Panel de Control</p>
        </div>
        
        <nav className="flex-1 space-y-2 px-4 mt-4 md:mt-0">
          <button 
            onClick={() => { setActiveTab('ventas'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'ventas' ? 'bg-brand-red text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <DollarSign size={20} className="mr-3" />
            Ventas y Envíos
            {orders.length > 0 && <span className="ml-auto bg-white text-brand-red text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status !== 'Entregado').length}</span>}
          </button>
          <button 
            onClick={() => { setActiveTab('productos'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'productos' ? 'bg-brand-red text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Package size={20} className="mr-3" />
            Catálogo
          </button>
          <button 
            onClick={() => { setActiveTab('configuracion'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'configuracion' ? 'bg-brand-red text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Settings size={20} className="mr-3" />
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 mt-auto">
          <button onClick={handleLogout} className="flex items-center text-gray-400 hover:text-white transition-colors w-full px-4 py-3 md:py-2 font-medium">
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative z-0">
        
        {/* ========== PESTAÑA DE VENTAS ========== */}
        {activeTab === 'ventas' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 font-montserrat">Historial de Ventas</h1>
                <p className="text-gray-500">Gestiona los pedidos, pagos y despachos a clientes.</p>
              </div>
              
              {/* Buscador inteligente de Órdenes */}
              <div className="relative w-full md:w-80">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-red transition-all shadow-sm">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Buscar por ID, Cliente o Barrio..." 
                    className="bg-transparent border-none focus:outline-none w-full ml-3 text-sm text-gray-700 font-medium placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay ventas registradas</h3>
                <p className="text-gray-500">Los pedidos confirmados aparecerán aquí automáticamente.</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron órdenes coincidiendo con "{orderSearchQuery}".</p>
                <button onClick={() => setOrderSearchQuery('')} className="text-brand-red font-bold mt-2">Limpiar búsqueda</button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    
                    {/* Header de la Orden */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center space-x-4">
                        <span className="font-mono font-bold text-gray-900">#{order.id}</span>
                        <span className="text-sm text-gray-500">{new Date(order.date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span className="text-sm font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {order.paymentMethod}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600">Estado:</span>
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-sm font-bold ml-2 rounded-lg pl-3 py-1.5 border-0 focus:ring-2 focus:ring-brand-red focus:outline-none appearance-none cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          <option value="Pendiente">⏳ Pago Pendiente</option>
                          <option value="Pago Confirmado">☑ Pago Confirmado</option>
                          <option value="Preparando">📦 Preparando paquete</option>
                          <option value="En Camino">🛵 En Camino</option>
                          <option value="Entregado">🏠 Entregado</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Cliente y Envío Info */}
                      <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Datos del Cliente</h3>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{order.customer.nombre}</p>
                          <p className="text-gray-600 mt-1">📞 {order.customer.telefono}</p>
                        </div>
                        
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <h4 className="flex items-center text-sm font-bold text-blue-900 mb-2">
                            <MapPin size={16} className="mr-1" /> Dirección de Entrega
                          </h4>
                          <p className="text-gray-800 font-medium">{order.customer.direccion}</p>
                          <p className="text-gray-600 text-sm mb-2 font-bold bg-white px-2 py-1 inline-block rounded border border-blue-100 mt-1">Barrio: {order.customer.barrio}</p>
                          {order.customer.ubicacionUrl && (
                            <a href={order.customer.ubicacionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-bold underline break-all mt-2 block">
                              Ver en Google Maps
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Lista de Productos */}
                      <div className="lg:col-span-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Productos ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</h3>
                        <div className="space-y-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                                <div className="ml-4">
                                  <p className="font-bold text-gray-900">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">Talle: {item.size} | Cantidad: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-bold text-gray-900">${(item.product.price * item.quantity).toLocaleString('es-AR')}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
                          <span className="text-gray-500 font-medium">Total de la Orden</span>
                          <span className="text-3xl font-black text-brand-dark">${order.total.toLocaleString('es-AR')}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== PESTAÑA DE PRODUCTOS ========== */}
        {activeTab === 'productos' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Inventario de Productos ({products.length})</h1>
              
              <div className="flex items-center space-x-4 w-full md:w-auto">
                {/* Buscador inteligente de Productos */}
                <div className="relative w-full md:w-72">
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-red transition-all shadow-sm">
                    <Search size={18} className="text-gray-400 shrink-0" />
                    <input 
                      type="text" 
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Buscar por Nombre, Marca o Categoría..." 
                      className="bg-transparent border-none focus:outline-none w-full ml-3 text-sm text-gray-700 font-medium placeholder-gray-400"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleOpenModal()}
                  className="flex flex-row items-center whitespace-nowrap justify-center btn-primary px-4 py-2.5 rounded-xl h-[46px]"
                >
                  <Plus size={20} className="mr-2" />
                  Nuevo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img className="h-10 w-10 rounded-lg object-cover border border-gray-100" src={product.image_url} alt={product.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 font-semibold">{product.brand}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${product.price.toLocaleString('es-AR')}
                          {product.discount > 0 && (
                            <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                              -{product.discount}%
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                            En Stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => updateProduct(product.id, { is_visible: product.is_visible === false ? true : false })} 
                              className={`${product.is_visible === false ? 'text-gray-400' : 'text-blue-600'} hover:text-blue-900 transition-colors`}
                              title={product.is_visible === false ? 'Mostrar producto' : 'Ocultar producto'}
                            >
                              {product.is_visible === false ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
                            </button>
                            <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="p-4 flex flex-col sm:flex-row gap-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img className="h-16 w-16 rounded-xl object-cover border border-gray-100" src={product.image_url} alt={product.name} />
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900 line-clamp-2">{product.name}</div>
                          <div className="text-xs text-gray-500 font-semibold mb-1">{product.brand} - {product.category}</div>
                          <div className="text-sm font-black text-gray-900">
                            ${product.price.toLocaleString('es-AR')}
                            {product.discount > 0 && <span className="ml-2 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">-{product.discount}%</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2 sm:mt-0 sm:flex-col sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                        <span className="px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full bg-green-100 text-green-800">Stock</span>
                        <div className="flex space-x-4">
                          <button 
                            onClick={() => updateProduct(product.id, { is_visible: product.is_visible === false ? true : false })} 
                            className={`p-2 rounded-lg ${product.is_visible === false ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}
                          >
                            {product.is_visible === false ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>}
                          </button>
                          <button onClick={() => handleOpenModal(product)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white">
                  <p className="text-gray-500">No se encontraron productos para "{productSearchQuery}"</p>
                  <button onClick={() => setProductSearchQuery('')} className="text-brand-red font-bold mt-2 hover:underline">Ver todos los productos</button>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 flex items-center">
              <Package size={24} className="mr-4 text-yellow-600" />
              <div>
                <h3 className="font-bold text-lg mb-1">Catálogo Inteligente</h3>
                <p className="text-sm">El buscador ahora filtra en tiempo real por el nombre exacto, marca (ej. Rolex, Nike) o categoría.</p>
              </div>
            </div>
          </div>
        )}

        {/* ========== PESTAÑA DE CONFIGURACION ========== */}
        {activeTab === 'configuracion' && (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h1 className="text-3xl font-bold text-gray-900 font-montserrat">Configuración de la Tienda</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center">
                <Truck className="text-brand-red mr-3" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Costo de Envío</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500 mb-6">
                  Establece un precio fijo para el costo de envío que se aplicará a todos los pedidos (ideal para envíos por Correo Argentino a Sucursal). 
                  Este monto se sumará al total de la compra del cliente automáticamente.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Costo de Envío Nacional ($)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={18} className="text-gray-400" />
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={newShippingCostInput}
                          onChange={(e) => setNewShippingCostInput(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red text-lg font-bold text-gray-900" 
                          placeholder="Ej: 9000"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Para cualquier código postal excepto 5300.</p>
                    </div>
                  </div>

                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Costo de Envío Local - La Rioja (CP 5300) ($)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={18} className="text-gray-400" />
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={newLocalShippingCostInput}
                          onChange={(e) => setNewLocalShippingCostInput(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-blue-900 bg-blue-50" 
                          placeholder="Ej: 1500"
                        />
                      </div>
                      <p className="text-xs text-blue-500 mt-1">Precio exclusivo para el CP 5300.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        await updateShippingCost(Number(newShippingCostInput));
                        await updateLocalShippingCost(Number(newLocalShippingCostInput));
                        await updateMpDiscount(Number(newMpDiscountInput));
                        alert('Configuraciones actualizadas con éxito.');
                      }}
                      className="btn-primary flex items-center px-6 py-3 rounded-xl h-[50px] shrink-0"
                    >
                      <Save size={20} className="mr-2" />
                      Guardar Precios
                    </button>
                  </div>

                  {/* MP Discount */}
                  <div className="flex items-end space-x-4 pt-4 border-t border-gray-100">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Descuento Pago Transferencia / Alias (%)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 font-bold">%</span>
                        </div>
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          value={newMpDiscountInput}
                          onChange={(e) => setNewMpDiscountInput(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-bold text-green-900 bg-green-50" 
                          placeholder="Ej: 3.49"
                        />
                      </div>
                      <p className="text-xs text-green-600 mt-1">Porcentaje que se descontará al elegir Pagar con Alias.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BANNERS DE PUBLICIDAD */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mt-8">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center">
                  <Upload className="text-brand-red mr-3" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Pantallas de Publicidad (Home)</h2>
                </div>
                {isUploadingBanner && <span className="text-sm font-bold text-blue-500 animate-pulse">Subiendo imagen...</span>}
              </div>
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                  <h4 className="font-bold text-blue-900 flex items-center mb-1"><CheckCircle size={16} className="mr-1"/> Recomendación PRO</h4>
                  <p className="text-sm text-blue-800">
                    Sube imágenes de <strong>1920x600 píxeles</strong> en formato <strong>JPG, PNG o WEBP</strong> (máx 10MB). Estas imágenes aparecerán en el carrusel de la página principal. El sistema ajustará y recortará automáticamente la imagen para móviles y PC.
                  </p>
                </div>

                <div className="space-y-4">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const bannerUrl = banners[index];
                    return (
                      <div key={index} className="flex flex-col md:flex-row gap-4 items-center p-4 border border-gray-200 rounded-xl bg-white">
                        <div className="w-full md:w-1/4">
                          <h3 className="font-bold text-gray-700">Pantalla {index + 1}</h3>
                        </div>
                        <div className="w-full md:w-3/4 flex items-center gap-4">
                          {bannerUrl ? (
                            <>
                              <div className="relative w-40 h-16 rounded overflow-hidden border border-gray-200 shrink-0">
                                <img src={bannerUrl} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                              <button 
                                onClick={() => removeBanner(index)}
                                className="flex items-center text-sm font-bold text-red-500 hover:text-red-700 transition-colors ml-auto"
                              >
                                <Trash2 size={16} className="mr-1" /> Eliminar
                              </button>
                            </>
                          ) : (
                            <div className="w-full">
                              <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <Upload size={18} className="text-gray-400 mr-2" />
                                <span className="text-sm font-bold text-gray-500">Haz clic para subir imagen</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleBannerUpload(index, e)} disabled={isUploadingBanner} />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-xl leading-6 font-bold text-gray-900 font-montserrat" id="modal-title">
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                      </h3>
                      <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                      </button>
                    </div>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                        <input required type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
                          <input required type="text" value={productForm.brand} onChange={(e) => setProductForm({...productForm, brand: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                          <select required value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red">
                            <option value="Calzado">Calzado</option>
                            <option value="Ropa">Ropa</option>
                            <option value="Accesorios">Accesorios</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Precio ($)</label>
                          <input required type="number" min="0" value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Descuento (%)</label>
                          <input type="number" min="0" max="100" value={productForm.discount} onChange={(e) => setProductForm({...productForm, discount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" placeholder="0" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Imagen del Producto</label>
                        <div className="flex items-center space-x-4">
                          {productForm.image_url ? (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              <img src={productForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setProductForm({...productForm, image_url: ''})}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shrink-0">
                              <Upload size={20} className="text-gray-400 mb-1" />
                              <span className="text-[10px] text-gray-500 font-bold uppercase">Sin foto</span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={isUploading}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-red-50 file:text-brand-red hover:file:bg-red-100 transition-all cursor-pointer focus:outline-none" 
                            />
                            {isUploading && <p className="text-xs font-bold text-blue-600 mt-2 animate-pulse">Subiendo imagen a Supabase...</p>}
                            {uploadError && <p className="text-xs font-bold text-red-500 mt-2">{uploadError}</p>}
                            <p className="text-xs text-gray-400 mt-2">Se aceptan fotos de celular de alta calidad. Máx: 10MB.</p>
                          </div>
                        </div>
                      </div>

                      {/* Galería Adicional */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Galería de Imágenes Adicionales (Opcional)</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          {(productForm.additional_images || []).length > 0 && (
                            <div className="flex flex-wrap gap-4 mb-4">
                              {(productForm.additional_images || []).map((imgUrl, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                  <img src={imgUrl} alt={`Adicional ${idx}`} className="w-full h-full object-cover" />
                                  <button 
                                    type="button" 
                                    onClick={() => removeAdditionalImage(idx)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <label className="flex flex-col items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-white transition-colors">
                            <Upload size={20} className="text-gray-400 mb-1" />
                            <span className="text-sm font-bold text-brand-dark">Añadir más fotos</span>
                            <span className="text-xs text-gray-500">Puedes seleccionar varias fotos a la vez</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalImageUpload}
                              disabled={isUploading}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                        <textarea required value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"></textarea>
                      </div>

                      {/* --- SECCIÓN DE TALLES --- */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-bold text-gray-700">Talles Disponibles</label>
                          <select 
                            value={selectedSizeCategory}
                            onChange={(e) => setSelectedSizeCategory(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg focus:ring-brand-red focus:border-brand-red py-1.5 px-3 font-semibold bg-white"
                          >
                            {Object.keys(SIZES_OPTIONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {SIZES_OPTIONS[selectedSizeCategory].map(size => {
                            const isSelected = (productForm.sizes || []).includes(size);
                            return (
                              <button
                                type="button"
                                key={size}
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                  isSelected 
                                  ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-dark'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Selecciona los talles que tienes en stock. Se mostrarán al cliente en la página del producto. <br/>
                          Seleccionados: <span className="font-bold text-brand-red">{(productForm.sizes || []).join(', ') || 'Ninguno'}</span>
                        </p>
                      </div>
                      {/* ----------------------- */}

                      {/* --- SECCIÓN DE COLORES --- */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Colores Disponibles</label>
                        <div className="flex items-center gap-2 mb-3">
                          <input 
                            type="text" 
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const c = colorInput.trim();
                                if (c && !(productForm.colors || []).includes(c)) {
                                  setProductForm(prev => ({ ...prev, colors: [...(prev.colors || []), c] }));
                                  setColorInput('');
                                }
                              }
                            }}
                            placeholder="Ej: Negro, Blanco, Rojo..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const c = colorInput.trim();
                              if (c && !(productForm.colors || []).includes(c)) {
                                setProductForm(prev => ({ ...prev, colors: [...(prev.colors || []), c] }));
                                setColorInput('');
                              }
                            }}
                            className="px-4 py-2 bg-brand-dark text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {(productForm.colors || []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(productForm.colors || []).map((color, idx) => (
                              <span key={idx} className="inline-flex items-center bg-white border border-gray-300 text-gray-800 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">
                                <span className="w-3 h-3 rounded-full mr-2 border border-gray-300" style={{ backgroundColor: color.toLowerCase() }}></span>
                                {color}
                                <button type="button" onClick={() => setProductForm(prev => ({ ...prev, colors: (prev.colors || []).filter((_, i) => i !== idx) }))} className="ml-2 text-gray-400 hover:text-red-500 transition-colors">
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-3">
                          Escribe el nombre del color y presiona Enter o el botón +. Se mostrarán al cliente para elegir.
                        </p>
                      </div>
                      {/* ----------------------- */}

                      <div className="pt-4 flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={isUploading || !productForm.image_url} className="px-4 py-2 bg-brand-red text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
