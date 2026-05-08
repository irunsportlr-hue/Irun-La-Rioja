import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const newOrder = {
          ...order,
          id: Math.random().toString(36).substring(2, 10).toUpperCase(),
          date: new Date().toISOString(),
          status: 'Pago Confirmado', // Pago Confirmado -> Preparando -> En Camino -> Entregado
        };
        set({ orders: [newOrder, ...get().orders] });
        return newOrder.id; // Retornamos el ID para usarlo en la vista Success
      },
      updateOrderStatus: (orderId, newStatus) => {
        set({
          orders: get().orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        });
      },
      clearOrders: () => set({ orders: [] })
    }),
    {
      name: 'irun-orders-storage',
    }
  )
);

export default useOrderStore;
