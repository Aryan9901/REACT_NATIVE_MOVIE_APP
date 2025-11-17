import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    cartTotal,
    cartItemCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  } = useStoreStore();

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateCartQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, currentQuantity - 1);
    }
  };

  if (cart.length === 0) {
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
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-4">
              Cart ({cartItemCount} items)
            </Text>
          </View>
          <TouchableOpacity onPress={clearCart}>
            <Text className="text-red-600 font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cart Items */}
      <ScrollView className="flex-1 px-4 py-3">
        {cart.map((item) => (
          <View
            key={item.productId}
            className="bg-white rounded-lg mb-3 p-3 flex-row border border-gray-200"
          >
            {/* Product Image */}
            <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mr-3">
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
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
            <View className="flex-1">
              <Text
                className="text-sm font-semibold text-gray-900 mb-1"
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text className="text-base font-bold text-gray-900 mb-2">
                ₹{item.price}
              </Text>

              {/* Quantity Controls */}
              <View className="flex-row items-center">
                <View className="flex-row items-center bg-orange-500 rounded-lg">
                  <TouchableOpacity
                    onPress={() =>
                      handleDecrement(item.productId, item.quantity)
                    }
                    className="w-8 h-8 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text className="text-white font-bold px-3">
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleIncrement(item.productId, item.quantity)
                    }
                    className="w-8 h-8 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <Text className="text-sm font-bold text-gray-900 ml-auto">
                  ₹{item.price * item.quantity}
                </Text>
              </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={() => removeFromCart(item.productId)}
              className="ml-2"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Summary */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base font-semibold text-gray-700">
            Subtotal
          </Text>
          <Text className="text-xl font-bold text-gray-900">₹{cartTotal}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            // Navigate to checkout - implement this route as needed
            console.log("Proceed to checkout");
          }}
          className="bg-orange-500 rounded-lg py-3 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
