import Header from "@/components/Header";
import * as AuthService from "@/services/auth";
import { useAuthStore } from "@/stores";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const EditProfile = () => {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    emailId: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        emailId: user.emailId || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!formData.emailId.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailId)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!user?.mobileNo) {
      Alert.alert("Error", "User mobile number not found");
      return;
    }

    try {
      setLoading(true);

      await AuthService.updateUserProfile(
        formData.name,
        formData.emailId,
        user.mobileNo
      );

      // Refresh user data in context
      await refreshUser();

      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        className="bg-gray-50 px-4 py-6"
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
      >
        <View className="bg-white px-4 py-6 mb-2">
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-slate-400 items-center justify-center mb-3">
              <Ionicons name="person" size={48} color="#000" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              {user?.name || "User"}
            </Text>
          </View>
        </View>

        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Personal Information
          </Text>
          <Text className="text-sm text-gray-500 mb-6">
            Update your name and email address.
          </Text>

          {/* Full Name Field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Full Name
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-3 ">
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Email Field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Email Address
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg px-3">
              <MaterialIcons name="email" size={20} color="#64748b" />
              <TextInput
                value={formData.emailId}
                onChangeText={(text) =>
                  setFormData({ ...formData, emailId: text })
                }
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3 text-base text-gray-900"
              />
            </View>
          </View>

          {/* Mobile Number Field (Disabled) */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Contact Number
            </Text>
            <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-lg px-3">
              <Ionicons name="call-outline" size={20} color="#64748b" />
              <TextInput
                value={user?.mobileNo || ""}
                editable={false}
                className="flex-1 ml-3 text-base text-gray-500"
              />
            </View>
            <Text className="text-xs text-gray-500 mt-1 ml-1">
              Contact number cannot be changed.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg items-center flex-row justify-center ${
                loading ? "bg-green-400" : "bg-green-600"
              }`}
              activeOpacity={0.7}
            >
              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-white font-semibold text-base">
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EditProfile;
