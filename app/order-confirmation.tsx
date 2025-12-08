import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [countdown, setCountdown] = useState(5);

  const {
    orderId,
    total,
    estimatedDelivery,
    vendorName,
    vendorContact,
    paymentStatus,
  } = params;

  useEffect(() => {
    // Animate the checkmark and content
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-redirect to store after 5 seconds
    const timer = setTimeout(() => {
      router.replace("/store");
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleCallVendor = () => {
    if (vendorContact) {
      Linking.openURL(`tel:${vendorContact}`);
    }
  };

  const handleViewOrder = () => {
    if (orderId && orderId !== "N/A") {
      router.replace(`/orders/${orderId}`);
    } else {
      router.replace("/store");
    }
  };

  const handleContinueShopping = () => {
    router.replace("/store");
  };

  const isPaid = paymentStatus === "Paid";
  const hasOrderId = orderId && orderId !== "N/A";

  return (
    <View className="flex-1 bg-gradient-to-b from-green-50 to-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5 pt-12 pb-6">
          {/* Success Animation Container */}
          <View className="items-center mb-8">
            {/* Outer Ring */}
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="w-32 h-32 rounded-full bg-green-100 items-center justify-center"
            >
              {/* Inner Circle with Checkmark */}
              <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center shadow-lg">
                <Ionicons name="checkmark" size={56} color="white" />
              </View>
            </Animated.View>

            {/* Success Text */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="items-center mt-6"
            >
              <Text className="text-2xl font-bold text-gray-900 mb-2">
                Order Confirmed! 🎉
              </Text>
              <Text className="text-gray-500 text-center text-base px-4">
                Thank you for your order. We've received it and will process it
                shortly.
              </Text>
            </Animated.View>
          </View>

          {/* Order Details Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-4"
          >
            {/* Card Header */}
            <View className="bg-orange-500 px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-bold text-lg">
                  Order Details
                </Text>
                {hasOrderId && (
                  <View className="bg-white/20 rounded-full px-3 py-1">
                    <Text className="text-white text-sm font-medium">
                      #{orderId}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Card Content */}
            <View className="p-4">
              {/* Total Amount */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="wallet-outline" size={20} color="#16a34a" />
                  </View>
                  <Text className="text-gray-600 text-base">Total Amount</Text>
                </View>
                <Text className="font-bold text-xl text-green-600">
                  {total}
                </Text>
              </View>

              {/* Payment Status */}
              <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                      isPaid ? "bg-green-100" : "bg-orange-100"
                    }`}
                  >
                    <Ionicons
                      name={
                        isPaid ? "checkmark-circle-outline" : "time-outline"
                      }
                      size={20}
                      color={isPaid ? "#16a34a" : "#ea580c"}
                    />
                  </View>
                  <Text className="text-gray-600 text-base">Payment</Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    isPaid ? "bg-green-100" : "bg-orange-100"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      isPaid ? "text-green-700" : "text-orange-700"
                    }`}
                  >
                    {paymentStatus}
                  </Text>
                </View>
              </View>

              {/* Estimated Delivery */}
              {estimatedDelivery && (
                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <View className="flex-row items-center flex-1">
                    <View className="w-9 h-9 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="bicycle-outline"
                        size={20}
                        color="#2563eb"
                      />
                    </View>
                    <Text className="text-gray-600 text-base">Delivery</Text>
                  </View>
                  <Text className="font-semibold text-gray-800 text-right flex-1 ml-2">
                    {estimatedDelivery}
                  </Text>
                </View>
              )}

              {/* Vendor Info */}
              {vendorName && (
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-9 h-9 bg-purple-100 rounded-full items-center justify-center mr-3">
                      <Ionicons
                        name="storefront-outline"
                        size={20}
                        color="#7c3aed"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 text-sm">Sold by</Text>
                      <Text className="font-semibold text-gray-800">
                        {vendorName}
                      </Text>
                    </View>
                  </View>
                  {vendorContact && (
                    <TouchableOpacity
                      onPress={handleCallVendor}
                      className="bg-green-500 rounded-full p-2.5 shadow-sm"
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </Animated.View>

          {/* What's Next Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4"
          >
            <Text className="font-bold text-gray-900 text-base mb-3">
              What happens next?
            </Text>
            <View className="gap-3">
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">1</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Order Confirmation
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    You'll receive a confirmation on WhatsApp
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">2</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    Order Processing
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    The vendor will prepare your order
                  </Text>
                </View>
              </View>
              <View className="flex-row items-start">
                <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium">
                    {estimatedDelivery?.includes("Pickup")
                      ? "Ready for Pickup"
                      : "Out for Delivery"}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {estimatedDelivery?.includes("Pickup")
                      ? "We'll notify you when your order is ready"
                      : "Your order will be delivered to your address"}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Auto-redirect notice */}
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="items-center mb-4"
          >
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-2">
                Redirecting to store in {countdown}s...
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="gap-3"
          >
            {hasOrderId && (
              <TouchableOpacity
                onPress={handleViewOrder}
                className="bg-orange-500 rounded-xl py-4 flex-row items-center justify-center shadow-sm"
                activeOpacity={0.8}
              >
                <Ionicons name="receipt-outline" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">
                  View Order Details
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleContinueShopping}
              className="bg-white border-2 border-gray-200 rounded-xl py-4 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold text-base ml-2">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
