import { STORAGE_KEYS } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface AttributeValueProps {
  name: string;
  value: string;
}

interface Vendor {
  id: string;
  name: string;
  shopName: string;
  contactNo: string;
  profileImage: string;
  vendorImages: string[];
  vendorCategories: any[];
  attributeValues: AttributeValueProps[];
  deliveryRadius: number;
  address?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
}

interface StoreState {
  selectedVendor: Vendor | null;
  deliveryLocation: DeliveryLocation | null;
  cart: CartItem[];
  isLoading: boolean;
  cartTotal: number;
  cartItemCount: number;
  selectedCategory: any | null;
  selectedSubCategory: any | null;

  // Actions
  setSelectedVendor: (vendor: Vendor | null) => void;
  setDeliveryLocation: (location: DeliveryLocation | null) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadStoredData: () => Promise<void>;
  setSelectedCategory: (category: any, subCategory: any) => void;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  selectedVendor: null,
  deliveryLocation: null,
  cart: [],
  isLoading: true,
  cartTotal: 0,
  cartItemCount: 0,
  selectedCategory: null,
  selectedSubCategory: null,

  loadStoredData: async () => {
    try {
      const [vendorData, locationData, cartData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_VENDOR),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_CART),
      ]);

      const updates: any = { isLoading: false };

      if (vendorData) updates.selectedVendor = JSON.parse(vendorData);
      if (locationData) updates.deliveryLocation = JSON.parse(locationData);
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        updates.cart = parsedCart;
        updates.cartTotal = parsedCart.reduce(
          (sum: number, item: CartItem) => sum + item.price * item.quantity,
          0
        );
        updates.cartItemCount = parsedCart.reduce(
          (sum: number, item: CartItem) => sum + item.quantity,
          0
        );
      }

      set(updates);
    } catch (error) {
      console.error("Error loading store data:", error);
      set({ isLoading: false });
    }
  },

  setSelectedVendor: async (vendor) => {
    try {
      const currentVendor = get().selectedVendor;

      if (vendor) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SELECTED_VENDOR,
          JSON.stringify(vendor)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_VENDOR);
      }

      set({ selectedVendor: vendor });

      // Clear cart when vendor changes
      if (vendor?.id !== currentVendor?.id) {
        get().clearCart();
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  },

  setDeliveryLocation: async (location) => {
    try {
      if (location) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SELECTED_LOCATION,
          JSON.stringify(location)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_LOCATION);
      }
      set({ deliveryLocation: location });
    } catch (error) {
      console.error("Error saving location:", error);
    }
  },

  addToCart: async (item) => {
    try {
      const { cart } = get();
      const existingIndex = cart.findIndex(
        (i) => i.productId === item.productId
      );
      let newCart: CartItem[];

      if (existingIndex >= 0) {
        newCart = [...cart];
        newCart[existingIndex].quantity += item.quantity;
      } else {
        newCart = [...cart, item];
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CART,
        JSON.stringify(newCart)
      );

      const cartTotal = newCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const cartItemCount = newCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      set({ cart: newCart, cartTotal, cartItemCount });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  },

  removeFromCart: async (productId) => {
    try {
      const { cart } = get();
      const newCart = cart.filter((item) => item.productId !== productId);

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CART,
        JSON.stringify(newCart)
      );

      const cartTotal = newCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const cartItemCount = newCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      set({ cart: newCart, cartTotal, cartItemCount });
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  },

  updateCartQuantity: async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        get().removeFromCart(productId);
        return;
      }

      const { cart } = get();
      const newCart = cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CART,
        JSON.stringify(newCart)
      );

      const cartTotal = newCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const cartItemCount = newCart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      set({ cart: newCart, cartTotal, cartItemCount });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  },

  clearCart: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_CART);
      set({ cart: [], cartTotal: 0, cartItemCount: 0 });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  },

  setSelectedCategory: (category, subCategory) => {
    set({ selectedCategory: category, selectedSubCategory: subCategory });
  },
}));
