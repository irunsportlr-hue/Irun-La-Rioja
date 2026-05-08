import { useState, useEffect } from 'react';
import { Package, DollarSign, LogOut, Plus, Edit2, Trash2, MapPin, CheckCircle, Clock, Truck, Home, Search, X, Menu, Upload } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore';
import useProductStore from '../../store/useProductStore';
import { supabase } from '../../lib/supabaseClient';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('ventas');
  
  // Órdenes
  const { orders, updateOrderStatus } = useOrderStore();
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Catálogo
  const products = useProductStore(state => state.products);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const isLoading = useProductStore(state => state.isLoading);
  const addProduct = useProductStore(state => state.addProduct);
  const updateProduct = useProductStore(state => state.updateProduct);
  const deleteProduct = useProductStore(state => state.deleteProduct);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', discount: 0, category: 'Calzado', brand: '', image_url: '', description: '' });
  
  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenModal = (product = null) => {
    setUploadError('');
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, discount: product.discount || 0 });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', price: '', discount: 0, category: 'Calzado', brand: '', image_url: '', description: '' });
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
    const isId = order.id.toLowerCase().includes(q);
    const isName = order.customer.nombre.toLowerCase().includes(q);
    const isBarrio = order.customer.barrio.toLowerCase().includes(q);
    // Podemos buscar por nombre de cliente, barrio, O el ID de la orden
    return isId || isName || isBarrio;
  });

  // Lógica Filtrado de Productos
  const filteredProducts = productSearchQuery.trim().length > 0 
    ? searchProducts(productSearchQuery) 
    : products;

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
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
                            <button onClick={() => handleOpenModal(product)} className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                        <textarea required value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"></textarea>
                      </div>
                      <div className="pt-4 flex justify-end space-x-3">
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
