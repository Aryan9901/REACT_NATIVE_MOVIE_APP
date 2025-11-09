import { EmailJSResponseStatus, send } from "@emailjs/react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Mock user data - replace with real data later
const getMockUser = () => ({
  name: "Valued Customer",
  email: "customer@example.com",
});

export default function Contact() {
  const router = useRouter();
  const user = getMockUser();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleBackPress = () => {
    router.replace("/(tabs)/profile");
    return true; // Prevent default back behavior
  };

  const handleSendMessage = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await send(
        process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID || "",
        process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID || "",
        {
          user_name: formData.name,
          user_email: formData.email,
          message: formData.message,
        },
        {
          publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY || "",
        }
      );

      Alert.alert("Success", "Message sent successfully! ✅");
      setFormData({ ...formData, message: "" });
    } catch (err) {
      if (err instanceof EmailJSResponseStatus) {
        console.log("EmailJS Request Failed...", err);
        Alert.alert("Error", `Failed to send message: ${err.text}`);
      } else {
        console.log("ERROR", err);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/profile")}
          className="flex-row items-center mb-4"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Back
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Get in Touch
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          We'd love to hear from you. Reach out to us through any of the methods
          below, or fill out the form and we'll get back to you soon.
        </Text>

        {/* Contact Form */}
        <View className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <View className="flex-row items-center mb-6">
            <Ionicons name="send" size={20} color="#16a34a" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Send us a Message
            </Text>
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Name</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Your name"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            />
          </View>

          {/* Message Input */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Message
            </Text>
            <TextInput
              value={formData.message}
              onChangeText={(text) =>
                setFormData({ ...formData, message: text })
              }
              placeholder="How can we help you?"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={loading}
            className={`py-4 rounded-lg flex-row items-center justify-center ${loading ? "bg-green-400" : "bg-green-600"}`}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-semibold text-base ml-2">
                  Sending...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Send Message
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
