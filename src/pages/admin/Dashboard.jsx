import { useState } from 'react';
import { Package, DollarSign, LogOut, Plus, Edit2, Trash2, MapPin, CheckCircle, Clock, Truck, Home, Search } from 'lucide-react';
import useOrderStore from '../../store/useOrderStore';
import useProductStore from '../../store/useProductStore';

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
  const searchProducts = useProductStore(state => state.searchProducts);
  const [productSearchQuery, setProductSearchQuery] = useState('');

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
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col pt-6">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-bold font-montserrat text-white tracking-tight">
            I-RUN <span className="text-brand-red">/</span> ADMIN
          </h2>
          <p className="text-gray-400 text-sm mt-1">Panel de Control</p>
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
          <button 
            onClick={() => setActiveTab('ventas')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'ventas' ? 'bg-brand-red text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <DollarSign size={20} className="mr-3" />
            Ventas y Envíos
            {orders.length > 0 && <span className="ml-auto bg-white text-brand-red text-xs px-2 py-0.5 rounded-full">{orders.filter(o => o.status !== 'Entregado').length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('productos')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'productos' ? 'bg-brand-red text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Package size={20} className="mr-3" />
            Catálogo
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center text-gray-400 hover:text-white transition-colors w-full px-4 py-2 font-medium">
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">
        
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

                <button className="flex flex-row items-center whitespace-nowrap justify-center btn-primary px-4 py-2.5 rounded-xl h-[46px]">
                  <Plus size={20} className="mr-2" />
                  Nuevo
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredProducts.length > 0 ? (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${product.price.toLocaleString('es-AR')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                            En Stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                            <button className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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
    </div>
  );
};

export default AdminDashboard;
