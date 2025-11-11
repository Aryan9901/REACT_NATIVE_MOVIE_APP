import { useAuth } from "@/contexts/AuthContext";
import { Pressable, Text } from "react-native";

export default function SignInButton() {
  const { setShowAuthModal } = useAuth();

  return (
    <Pressable
      onPress={() => setShowAuthModal(true)}
      className="px-4 py-2 bg-orange-600 rounded-lg"
    >
      <Text className="text-white font-semibold">Sign In</Text>
    </Pressable>
  );
}
