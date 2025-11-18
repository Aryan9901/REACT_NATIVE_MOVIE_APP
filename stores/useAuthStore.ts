import { STORAGE_KEYS } from "@/lib/constants";
import * as AuthService from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  emailId: string;
  mobileNo: string;
  alternateContact: string;
  addressModel: Array<{
    id: string;
    addressLineOne: string;
    addressLineTwo: string;
    type: string;
    city: string;
    state: string;
    country: string;
    contactNo: string;
    pinCode: string;
    latitude: number;
    longitude: number;
  }>;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  isGuestMode: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setShowAuthModal: (show: boolean) => void;
  setIsGuestMode: (isGuest: boolean) => void;
  loadUser: () => Promise<void>;
  initiateLogin: (mobile: string) => Promise<any>;
  verifyOTP: (otp: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  showAuthModal: false,
  isGuestMode: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user?.id }),
  setLoading: (loading) => set({ loading }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
  setIsGuestMode: (isGuestMode) => set({ isGuestMode }),

  loadUser: async () => {
    try {
      const mobile = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);
      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );

      if (mobile && sessionToken) {
        set({ isGuestMode: false });
        const userData = await AuthService.getUserProfile(mobile);
        if (userData?.id) {
          set({ user: userData, isAuthenticated: true });
        }
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.GUEST_MODE, "true");
        set({ isGuestMode: true });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MOBILE,
        STORAGE_KEYS.SESSION_TOKEN,
      ]);
    } finally {
      set({ loading: false });
    }
  },

  initiateLogin: async (mobile: string) => {
    try {
      set({ loading: true });
      const data = await AuthService.sendOtp(mobile);
      return data;
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      set({ loading: false });
    }
  },

  verifyOTP: async (otp: string, mobile: string) => {
    try {
      set({ loading: true });
      const authData = await AuthService.verifyOtp(otp, mobile);

      if (!authData?.sessionToken) {
        throw new Error("Invalid authentication response");
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_TOKEN,
        authData.sessionToken
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        authData.refreshToken
      );
      await AsyncStorage.setItem(STORAGE_KEYS.MOBILE, mobile);

      let userData = await AuthService.getUserProfile(mobile);

      if (!userData?.id) {
        userData = await AuthService.createUser(mobile, authData.sessionToken);
      }

      if (!userData?.id) {
        throw new Error("Failed to get user data");
      }

      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_MODE);

      set({ user: userData, isAuthenticated: true, showAuthModal: false });
    } catch (error: any) {
      console.error("Failed to verify OTP:", error);
      throw new Error(error.response?.data?.message || "Invalid OTP");
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      const mobile = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);
      if (mobile) {
        AuthService.logoutUser(`+91${mobile}` as any);
      }
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MOBILE,
        STORAGE_KEYS.SESSION_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  },

  refreshUser: async () => {
    try {
      const mobile = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);
      if (mobile) {
        set({ loading: true });
        const userData = await AuthService.getUserProfile(mobile);
        if (userData?.id) {
          set({ user: userData, isAuthenticated: true });
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
