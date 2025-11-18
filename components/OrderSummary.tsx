import React from "react";
import { Text, View } from "react-native";

interface OrderSummaryData {
  itemTotal: number;
  totalSavings: number;
  deliveryCharge: number;
  isStrictMinimumOrderEnforced: boolean;
  isMinimumOrderMet: boolean;
  minimumOrderValue: number;
  grandTotal: number;
  progress: number;
}

interface OrderSummaryProps {
  orderSummary: OrderSummaryData;
}

const OrderSummary = ({ orderSummary }: OrderSummaryProps) => {
  return (
    <View className="bg-white rounded-lg mx-2 mb-2 py-2 px-3">
      <Text className="text-lg font-bold mb-3 text-gray-900">
        Order Summary
      </Text>
      <View className="space-y-2">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 font-semibold">Item Total</Text>
          <Text className="font-semibold text-gray-900">
            ₹{orderSummary?.itemTotal}
          </Text>
        </View>
        {orderSummary?.totalSavings > 0 && (
          <View className="flex-row justify-between mb-2">
            <Text className="text-green-600 font-semibold">Total Savings</Text>
            <Text className="text-green-600 font-semibold">
              ₹{orderSummary?.totalSavings}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 font-semibold">Delivery Charge</Text>
          <Text className="font-semibold text-gray-900">
            {orderSummary?.deliveryCharge === 0 ? (
              <Text className="text-green-600">FREE</Text>
            ) : (
              `₹${orderSummary?.deliveryCharge.toFixed(2)}`
            )}
          </Text>
        </View>
        <View className="border-t border-gray-200 pt-2 mt-2">
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-gray-900">Grand Total</Text>
            <Text className="text-lg font-bold text-orange-500">
              ₹{orderSummary?.grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Minimum Order Progress */}
      {orderSummary?.minimumOrderValue > 0 &&
        !orderSummary?.isMinimumOrderMet && (
          <View className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-sm text-yellow-800 font-semibold mb-2">
              Add ₹
              {(
                orderSummary?.minimumOrderValue - orderSummary?.itemTotal
              ).toFixed(2)}{" "}
              more to{" "}
              {orderSummary?.isStrictMinimumOrderEnforced
                ? "place order"
                : "get free delivery"}
            </Text>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500"
                style={{ width: `${orderSummary?.progress}%` }}
              />
            </View>
          </View>
        )}
    </View>
  );
};

export default OrderSummary;
