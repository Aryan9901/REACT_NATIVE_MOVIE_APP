import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface PaymentMethodProps {
  paymentMethod: string;
  allowedPaymentMethods: string[];
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethod = ({
  paymentMethod,
  allowedPaymentMethods,
  onPaymentMethodChange,
}: PaymentMethodProps) => {
  return (
    <View className="bg-white rounded-md mx-2 mb-1 py-2 px-3">
      <View className="flex-row items-center mb-2">
        <Ionicons name="wallet-outline" size={20} color="#F97316" />
        <Text className="text-lg font-bold text-gray-900 ml-2">
          Payment Method
        </Text>
      </View>

      <View className="">
        {/* Pay on Delivery */}
        {allowedPaymentMethods.includes("Pay On Delivery") && (
          <TouchableOpacity
            onPress={() => onPaymentMethodChange("Pay On Delivery")}
            className={`py-2 px-3 mb-2 rounded-md border-2 ${
              paymentMethod === "Pay On Delivery"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    paymentMethod === "Pay On Delivery"
                      ? "border-green-600 bg-green-600"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "Pay On Delivery" && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900">
                    Pay on Delivery
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Cash or UPI at doorstep
                  </Text>
                </View>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-xs font-bold text-green-800">
                  AVAILABLE
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Prepaid */}
        {allowedPaymentMethods.includes("Prepaid") && (
          <TouchableOpacity
            onPress={() => onPaymentMethodChange("Prepaid")}
            className={`py-2 px-3 rounded-md border-2 ${
              paymentMethod === "Prepaid"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    paymentMethod === "Prepaid"
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "Prepaid" && (
                    <View className="w-2 h-2 bg-white rounded-full" />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900">Pay Now</Text>
                  <Text className="text-xs text-gray-500">
                    UPI, Cards, Net Banking
                  </Text>
                </View>
              </View>
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-xs font-bold text-blue-800">SECURE</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PaymentMethod;
