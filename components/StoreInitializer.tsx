import { useAuthStore, useStoreStore } from "@/stores";
import { useEffect } from "react";

/**
 * Component to initialize Zustand stores on app startup
 * This replaces the need for Context Providers
 */
export default function StoreInitializer() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const loadStoredData = useStoreStore((state) => state.loadStoredData);

  useEffect(() => {
    // Initialize all stores on mount
    const initializeStores = async () => {
      await Promise.all([loadUser(), loadStoredData()]);
    };

    initializeStores();
  }, []);

  return null;
}
