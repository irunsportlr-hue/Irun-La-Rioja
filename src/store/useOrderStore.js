import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import useProductStore from './useProductStore';

const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          customer_neighborhood,
          location_url,
          total_amount,
          status,
          payment_method,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = useProductStore.getState().products;

      const formattedOrders = ordersData.map(order => {
        // Map pending to Pendiente
        let statusStr = order.status;
        if (statusStr === 'pending') statusStr = 'Pendiente';

        return {
          id: order.id.substring(0, 8).toUpperCase(), // Short ID for UI
          full_id: order.id,
          date: order.created_at,
          status: statusStr,
          paymentMethod: order.payment_method === 'mercadopago' ? 'Mercado Pago' : 'Tarjeta',
          customer: {
            nombre: order.customer_name || 'Desconocido',
            email: order.customer_email || '',
            telefono: order.customer_phone || '-',
            direccion: order.customer_address || '-',
            barrio: order.customer_neighborhood || '-',
            ubicacionUrl: order.location_url || ''
          },
          total: Number(order.total_amount) || 0,
          items: order.order_items.map(item => {
            // Find product to get image
            const productMatch = products.find(p => p.id === item.product_id || p.name === item.product_name);
            return {
              quantity: item.quantity,
              size: item.size,
              product: {
                id: item.product_id,
                name: item.product_name,
                price: Number(item.price_at_time),
                image_url: productMatch ? productMatch.image_url : 'https://via.placeholder.com/150?text=Sin+Foto'
              }
            };
          })
        };
      });

      set({ orders: formattedOrders });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    const orderToUpdate = get().orders.find(o => o.id === orderId || o.full_id === orderId);
    if (!orderToUpdate) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderToUpdate.full_id);

      if (error) throw error;

      set({
        orders: get().orders.map(order => 
          order.full_id === orderToUpdate.full_id ? { ...order, status: newStatus } : order
        )
      });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado: ' + error.message);
    }
  },
  
  clearOrders: () => set({ orders: [] })
}));

export default useOrderStore;

