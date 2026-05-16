import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useSettingsStore = create((set) => ({
  shippingCost: 0,
  localShippingCost: 0,
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
