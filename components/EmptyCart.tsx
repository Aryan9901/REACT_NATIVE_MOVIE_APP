import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const EmptyCart = () => {
  return (
    <View className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold ml-4">Cart</Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          Add some products to get started
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-orange-500 rounded-lg px-6 py-3"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold">Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EmptyCart;
