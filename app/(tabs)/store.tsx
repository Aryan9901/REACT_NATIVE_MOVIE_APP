import { useStore } from "@/contexts/StoreContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Store = () => {
  const { selectedVendor, isLoading, cartItemCount } = useStore();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!selectedVendor) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="storefront-outline" size={80} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">
          No Vendor Selected
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          Please select a vendor to view their store
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="bg-green-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Browse Vendors</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const image = selectedVendor.profileImage || selectedVendor.vendorImages?.[0];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with vendor info */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center p-4">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">
              <Ionicons name="storefront" size={32} color="#9CA3AF" />
            </View>
          )}
          <View className="flex-1 ml-4">
            <Text className="text-xl font-bold text-gray-900">
              {selectedVendor.shopName}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {selectedVendor.vendorCategories
                ?.map((cat: any) => cat.name)
                .join(" • ")}
            </Text>
          </View>
          {/* Cart Badge */}
          {cartItemCount > 0 && (
            <View className="bg-orange-500 rounded-full w-8 h-8 items-center justify-center">
              <Text className="text-white font-bold text-sm">
                {cartItemCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Store items will go here */}
      <View className="p-4">
        <Text className="text-gray-600 text-center mt-8">
          Store items coming soon...
        </Text>
      </View>
    </ScrollView>
  );
};

export default Store;
