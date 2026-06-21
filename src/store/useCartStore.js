import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, color = null) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.product.id === product.id && item.size === size && item.color === color
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.product.id === product.id && item.size === size && item.color === color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { product, size, color, quantity: 1 }] });
        }
      },
      removeItem: (productId, size, color = null) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.size === size && item.color === color)
          ),
        });
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      userZipCode: '',
      setUserZipCode: (zipCode) => set({ userZipCode: zipCode }),
    }),
    {
      name: 'irun-cart-storage',
    }
  )
);

export default useCartStore;
