import { Stack } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import "./globals.css";

export default function RootLayout() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
    </KeyboardAvoidingView>
  );
}
