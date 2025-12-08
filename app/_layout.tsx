import AuthCartModal from "@/components/AuthCartModal";
import Header from "@/components/Header";
import StoreInitializer from "@/components/StoreInitializer";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";
import "./globals.css";

// Only load Reactotron in development
if (__DEV__) {
  require("../ReactotronConfig");
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider
        placement="top"
        duration={3000}
        animationType="slide-in"
        offset={50}
      >
        <KeyboardProvider>
          <StoreInitializer />
          <StatusBar style="dark" translucent={true} backgroundColor="#fff" />
          <Stack>
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="shipping" options={{ headerShown: false }} />
            <Stack.Screen name="store" options={{ headerShown: false }} />
            <Stack.Screen
              name="product-details"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="return-policy"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/addresses"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="profile/edit-address"
              options={{ header: () => <Header /> }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="order-confirmation"
              options={{ headerShown: false }}
            />
          </Stack>
          <AuthCartModal />
        </KeyboardProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
