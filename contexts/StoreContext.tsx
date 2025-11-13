import { STORAGE_KEYS } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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

interface StoreContextType {
  selectedVendor: Vendor | null;
  setSelectedVendor: (vendor: Vendor | null) => void;
  deliveryLocation: DeliveryLocation | null;
  setDeliveryLocation: (location: DeliveryLocation | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedVendor, setSelectedVendorState] = useState<Vendor | null>(
    null
  );
  const [deliveryLocation, setDeliveryLocationState] =
    useState<DeliveryLocation | null>(null);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [vendorData, locationData, cartData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_VENDOR),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LOCATION),
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_CART),
      ]);

      if (vendorData) setSelectedVendorState(JSON.parse(vendorData));
      if (locationData) setDeliveryLocationState(JSON.parse(locationData));
      if (cartData) setCartState(JSON.parse(cartData));
    } catch (error) {
      console.error("Error loading store data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedVendor = async (vendor: Vendor | null) => {
    try {
      if (vendor) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SELECTED_VENDOR,
          JSON.stringify(vendor)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_VENDOR);
      }
      setSelectedVendorState(vendor);

      // Clear cart when vendor changes
      if (vendor?.id !== selectedVendor?.id) {
        await clearCart();
      }
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  const setDeliveryLocation = async (location: DeliveryLocation | null) => {
    try {
      if (location) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SELECTED_LOCATION,
          JSON.stringify(location)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_LOCATION);
      }
      setDeliveryLocationState(location);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const addToCart = async (item: CartItem) => {
    try {
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
      setCartState(newCart);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const newCart = cart.filter((item) => item.productId !== productId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CART,
        JSON.stringify(newCart)
      );
      setCartState(newCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const newCart = cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CART,
        JSON.stringify(newCart)
      );
      setCartState(newCart);
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_CART);
      setCartState([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        selectedVendor,
        setSelectedVendor,
        deliveryLocation,
        setDeliveryLocation,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        isLoading,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
