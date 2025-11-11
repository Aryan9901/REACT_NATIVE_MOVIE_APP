import { STORAGE_KEYS } from "@/lib/constants";
import * as AuthService from "@/services/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  initiateLogin: (mobile: string) => Promise<any>;
  verifyOTP: (otp: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isGuestMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(true);

  console.log(loading);

  const isAuthenticated = !!user?.id;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const mobile = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);
      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );

      if (mobile && sessionToken) {
        setIsGuestMode(false);
        const userData = await AuthService.getUserProfile(mobile);
        if (userData?.id) {
          setUser(userData);
        }
      } else {
        setIsGuestMode(true);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MOBILE,
        STORAGE_KEYS.SESSION_TOKEN,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const initiateLogin = async (mobile: string) => {
    try {
      console.log(mobile);
      setLoading(true);
      const data = await AuthService.sendOtp(mobile);
      return data;
    } catch (error: any) {
      console.error("Failed to send OTP:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string, mobile: string) => {
    try {
      setLoading(true);
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

      console.log(mobile);

      await AsyncStorage.setItem(STORAGE_KEYS.MOBILE, mobile);

      let userData = await AuthService.getUserProfile(mobile);

      console.log(userData);

      if (!userData?.id) {
        userData = await AuthService.createUser(mobile, authData.sessionToken);
      }

      if (!userData?.id) {
        throw new Error("Failed to get user data");
      }

      setUser(userData);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error("Failed to verify OTP:", error);
      throw new Error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.MOBILE,
        STORAGE_KEYS.SESSION_TOKEN,
      ]);
      setUser(null);
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const mobile = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);

      console.log(mobile);

      if (mobile) {
        setLoading(true);
        const userData = await AuthService.getUserProfile(mobile);
        if (userData?.id) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    showAuthModal,
    setShowAuthModal,
    initiateLogin,
    verifyOTP,
    logout,
    refreshUser,
    isGuestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
