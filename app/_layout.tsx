import AuthModal from "@/components/AuthModal";
import { AuthProvider } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <KeyboardProvider>
          <StatusBar
            style="dark"
            translucent={false}
            backgroundColor="#030014"
          />
          <Stack>
            {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="orders/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="privacy" options={{ headerShown: false }} />
            <Stack.Screen name="shipping" options={{ headerShown: false }} />
            <Stack.Screen
              name="return-policy"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{ headerShown: false }}
            />
          </Stack>
          <AuthModal />
        </KeyboardProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
