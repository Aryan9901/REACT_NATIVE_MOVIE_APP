import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "./globals.css";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <Stack>
        {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="shipping" options={{ headerShown: false }} />
        <Stack.Screen name="return-policy" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      </Stack>
    </KeyboardProvider>
  );
}
