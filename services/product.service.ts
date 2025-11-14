import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const productService = {
  async fetchProducts(categoryId: string, vendorId: string) {
    try {
      if (!categoryId || !vendorId) {
        return {
          success: false,
          data: [],
          error: "Missing required parameters",
        };
      }

      // Check if user is in guest mode
      const guestMode = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
      const isGuest = guestMode === "true";

      const headers: any = {
        "X-USER-ROLE": USER_ROLES.USER,
        "X-Vendor-Id": vendorId,
      };

      // Only add session token if not in guest mode
      if (!isGuest) {
        headers.sessionToken = await AsyncStorage.getItem(
          STORAGE_KEYS.SESSION_TOKEN
        );
      }

      const response = await axios.get(
        `${API_URL.BASE_VENDOR}/rest/big-local/api/v1/vendor/store/products?categoryId=${categoryId}`,
        { headers }
      );

      // Process the data to ensure consistent structure
      const processedData = response.data?.map((product: any) => ({
        ...product,
        // Ensure productImageUrls is always an array
        productImageUrls: Array.isArray(product.productImageUrls)
          ? product.productImageUrls
          : product.productImageUrl
          ? [product.productImageUrl]
          : [],
        // Ensure productVariants structure
        productVariants:
          product.productVariants?.map((variant: any) => ({
            ...variant,
            mrp: variant.mrp || 0,
            netPrice: variant.netPrice || 0,
            available: variant.available === true,
          })) || [],
      }));

      if (!processedData || processedData.length === 0) {
        return {
          success: true,
          data: [],
          error: null,
          isEmpty: true,
        };
      }

      return {
        success: true,
        data: processedData,
        error: null,
        isEmpty: false,
      };
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Failed to fetch products",
        isEmpty: false,
      };
    }
  },
};
