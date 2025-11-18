import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  total: string;
  estimatedDelivery: string;
  vendorName: string;
  vendorContact: string;
  onContinueShopping: () => void;
  onViewOrder: (orderId: string) => void;
  paymentStatus?: string;
}

const OrderConfirmationModal = ({
  isOpen,
  onClose,
  orderId,
  total,
  estimatedDelivery,
  vendorName,
  vendorContact,
  onContinueShopping,
  onViewOrder,
  paymentStatus = "Pending",
}: OrderConfirmationModalProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      // Animate in
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Set auto-close timer for 10 seconds
      timerRef.current = setTimeout(() => {
        handleContinueShopping();
      }, 10000);
    }

    // Cleanup timer
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOpen]);

  const handleContinueShopping = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onContinueShopping();
  };

  const handleViewOrder = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onViewOrder(orderId);
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>

          {/* Header */}
          <View className="bg-green-500 px-6 py-8 items-center">
            <View className="bg-white rounded-full w-16 h-16 items-center justify-center mb-3">
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text className="text-2xl font-bold text-white mb-1">
              🎉 Order Confirmed!
            </Text>
            {/* <Text className="text-white/90 text-sm">Order #{orderId}</Text> */}
          </View>

          {/* Content */}
          <View className="p-6">
            {/* Order Details */}
            <View className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-700">Total</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {total}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-700">Delivery</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {estimatedDelivery}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-700">Payment Status</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {paymentStatus}
                </Text>
              </View>
            </View>

            {/* Vendor Info */}
            <View className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    {vendorName}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    Supporting local business
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  {vendorContact && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          /* Handle WhatsApp */
                        }}
                        className="bg-green-500 rounded-full p-2"
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={16}
                          color="white"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          /* Handle Call */
                        }}
                        className="bg-green-500 rounded-full p-2"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="call" size={16} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Encouraging Message */}
            <View className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
              <Text className="text-sm text-center text-purple-800">
                ✨ <Text className="font-semibold">Why stop here?</Text>{" "}
                Discover more amazing products and support more local
                businesses!
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleViewOrder}
                className="flex-1 py-3 border border-gray-300 rounded-lg items-center"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#374151" />
                  <Text className="ml-2 font-medium text-gray-700">
                    Track Order
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinueShopping}
                className="flex-1 py-3 bg-green-500 rounded-lg items-center"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="bag-outline" size={16} color="white" />
                  <Text className="ml-2 font-medium text-white">
                    Keep Shopping
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Auto-close indicator */}
            <Text className="text-xs text-gray-400 text-center mt-4">
              Auto-closing in 10 seconds...
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default OrderConfirmationModal;
