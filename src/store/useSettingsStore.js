import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useSettingsStore = create((set) => ({
  shippingCost: 0,
  localShippingCost: 0,
  mpDiscount: 3.49,
  showTransferPrice: true,
  banners: [],
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      set({ 
        shippingCost: data ? data.shipping_cost : 0, 
        localShippingCost: data ? data.local_shipping_cost : 0,
        mpDiscount: data && data.mp_discount !== undefined ? data.mp_discount : 3.49,
        showTransferPrice: data && data.show_transfer_price !== undefined ? data.show_transfer_price : true,
        banners: data && data.banners ? data.banners : [],
        error: null 
      });
    } catch (error) {
      set({ error: error.message });
      console.error('Error fetching settings:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateShippingCost: async (newCost) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ shipping_cost: newCost })
        .eq('id', 1);

      if (error) throw error;
      set({ shippingCost: newCost });
    } catch (error) {
      console.error('Error updating shipping cost:', error);
      alert('Error al actualizar el costo de envío: ' + error.message);
    }
  },

  updateLocalShippingCost: async (newCost) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ local_shipping_cost: newCost })
        .eq('id', 1);

      if (error) throw error;
      set({ localShippingCost: newCost });
    } catch (error) {
      console.error('Error updating local shipping cost:', error);
      alert('Error al actualizar el costo de envío local: ' + error.message);
    }
  },

  updateMpDiscount: async (newDiscount) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ mp_discount: newDiscount })
        .eq('id', 1);

      if (error) throw error;
      set({ mpDiscount: newDiscount });
    } catch (error) {
      console.error('Error updating MP discount:', error);
      alert('Asegúrate de haber añadido la columna mp_discount en Supabase. Error: ' + error.message);
    }
  },

  updateShowTransferPrice: async (newValue) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ show_transfer_price: newValue })
        .eq('id', 1);

      if (error) throw error;
      set({ showTransferPrice: newValue });
    } catch (error) {
      console.error('Error updating show_transfer_price:', error);
      alert('Asegúrate de haber añadido la columna show_transfer_price en Supabase. Error: ' + error.message);
    }
  },

  updateBanners: async (newBanners) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ banners: newBanners })
        .eq('id', 1);

      if (error) throw error;
      set({ banners: newBanners });
    } catch (error) {
      console.error('Error updating banners:', error);
      alert('Error al actualizar los banners: ' + error.message);
    }
  }
}));

export default useSettingsStore;
