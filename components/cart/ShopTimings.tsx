import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface ShopTimingsProps {
  isShopOpen: boolean;
  isBreakTime: boolean;
  shopTiming: any;
  offHours: any;
  formatDisplayTime: (time: string) => string;
}

const ShopTimings = ({
  isShopOpen,
  isBreakTime,
  shopTiming,
  offHours,
  formatDisplayTime,
}: ShopTimingsProps) => {
  return (
    <View className="bg-white rounded-md mx-2 mb-1 py-2 px-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">Shop Timings</Text>
        <View
          className={`px-3 py-1 rounded-full flex-row items-center ${
            isShopOpen ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isShopOpen ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <Text
            className={`text-xs font-bold ${
              isShopOpen ? "text-green-700" : "text-red-700"
            }`}
          >
            {isShopOpen ? "Open Now" : isBreakTime ? "Break Time" : "Closed"}
          </Text>
        </View>
      </View>

      <View className="">
        <View className="flex-row mb-1 items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">Operating Hours:</Text>
          </View>
          <Text className="text-sm font-semibold text-gray-900">
            {formatDisplayTime(shopTiming?.start)} -{" "}
            {formatDisplayTime(shopTiming?.end)}
          </Text>
        </View>

        {offHours?.start && offHours?.end && (
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="cafe-outline" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">Break Time:</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900">
              {formatDisplayTime(offHours.start)} -{" "}
              {formatDisplayTime(offHours.end)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ShopTimings;
