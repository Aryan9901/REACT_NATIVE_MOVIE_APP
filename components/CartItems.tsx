import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItems = ({ handleDecrement, handleIncrement }: any) => {
  const { cart } = useStoreStore();

  return (
    <View className="px-2 pt-1 pb-1">
      {cart.map((item) => (
        <View
          key={item.variantId}
          className="bg-white rounded-md w-full mb-1 flex-row border border-gray-200"
        >
          {/* Product Image */}
          <View className="w-24 h-24  overflow-hidden bg-gray-100 mr-3">
            {item.productImageUrls ? (
              <Image
                source={{ uri: item.productImageUrls }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="image-outline" size={30} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1 pl-2 py-2">
            <Text
              className="text-base font-semibold text-gray-900 mb-1"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {item.mrp && item.mrp > item.price && (
              <View className="flex-row items-center mb-1">
                <Text className="text-base mr-2 font-bold text-gray-900">
                  ₹{item.price}
                </Text>
                <Text className="text-sm text-gray-400 line-through mr-2">
                  ₹{item.mrp}
                </Text>
                <Text className="text-sm text-green-600 font-semibold">
                  {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* Quantity Controls */}
          <View className="flex flex-col pr-2 py-2">
            <View className="flex-row  h-8 items-center bg-orange-500 rounded-full">
              <TouchableOpacity
                onPress={() => handleDecrement(item.variantId, item.quantity)}
                className="size-8 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color="#fff" />
              </TouchableOpacity>
              <Text className="text-white  font-bold">{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => handleIncrement(item.variantId, item.quantity)}
                className="w-8 h-8 items-center justify-center"
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm mt-2 mr-2 font-bold text-gray-900 ml-auto">
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default CartItems;
