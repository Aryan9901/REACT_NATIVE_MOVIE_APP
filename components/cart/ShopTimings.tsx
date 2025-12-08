import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, View } from "react-native";

interface ShopTimingsProps {
  shopTiming: any;
  offHours: any;
  vendorConfig?: any;
}

// Format time helper
const formatDisplayTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Check if shop is open
const checkShopOpen = (
  shopTiming: any,
  offHours: any,
  weeklyOffDay: string
) => {
  // Check if today is a weekly off day
  const today = new Date();
  if (weeklyOffDay) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[today.getDay()];
    const offDays = weeklyOffDay
      .split(";")
      .map((day: string) => day.trim().toLowerCase());
    if (offDays.includes(dayName.toLowerCase())) {
      return { isOpen: false, isBreakTime: false, isTodayHoliday: true };
    }
  }

  if (!shopTiming?.start || !shopTiming?.end) {
    return { isOpen: false, isBreakTime: false, isTodayHoliday: false };
  }

  const now = new Date();
  const currentTime = now.getHours() + now.getMinutes() / 60;

  const [startHour] = shopTiming.start.split(":").map(Number);
  const startTime = startHour + Number(shopTiming.start.split(":")[1]) / 60;

  const [endHour] = shopTiming.end.split(":").map(Number);
  const endTime = endHour + Number(shopTiming.end.split(":")[1]) / 60;

  const isOpenDuringOperatingHours =
    endTime > startTime
      ? currentTime >= startTime && currentTime < endTime
      : currentTime >= startTime || currentTime < endTime;

  // Check break time
  let isDuringBreak = false;
  if (offHours?.start && offHours?.end) {
    const [offStartHour] = offHours.start.split(":").map(Number);
    const offHoursStart =
      offStartHour + Number(offHours.start.split(":")[1]) / 60;
    const [offEndHour] = offHours.end.split(":").map(Number);
    const offHoursEnd = offEndHour + Number(offHours.end.split(":")[1]) / 60;
    isDuringBreak = currentTime >= offHoursStart && currentTime < offHoursEnd;
  }

  return {
    isOpen: isOpenDuringOperatingHours && !isDuringBreak,
    isBreakTime: isDuringBreak,
    isTodayHoliday: false,
  };
};

const ShopTimings = ({
  shopTiming,
  offHours,
  vendorConfig,
}: ShopTimingsProps) => {
  const {
    isOpen: isShopOpen,
    isBreakTime,
    isTodayHoliday,
  } = useMemo(() => {
    return checkShopOpen(
      shopTiming || vendorConfig?.shopTiming,
      offHours || vendorConfig?.offHours,
      vendorConfig?.weeklyOffDay || ""
    );
  }, [shopTiming, offHours, vendorConfig]);

  const getStatusText = () => {
    if (isTodayHoliday) return "Weekly Off";
    if (isBreakTime) return "Break Time";
    if (isShopOpen) return "Open Now";
    return "Closed";
  };

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
            {getStatusText()}
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
            {formatDisplayTime(
              shopTiming?.start || vendorConfig?.shopTiming?.start
            )}{" "}
            -{" "}
            {formatDisplayTime(
              shopTiming?.end || vendorConfig?.shopTiming?.end
            )}
          </Text>
        </View>

        {(offHours?.start || vendorConfig?.offHours?.start) &&
          (offHours?.end || vendorConfig?.offHours?.end) && (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="cafe-outline" size={18} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-2">Break Time:</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-900">
                {formatDisplayTime(
                  offHours?.start || vendorConfig?.offHours?.start
                )}{" "}
                -{" "}
                {formatDisplayTime(
                  offHours?.end || vendorConfig?.offHours?.end
                )}
              </Text>
            </View>
          )}

        {vendorConfig?.weeklyOffDay && (
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">Weekly Off:</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900">
              {vendorConfig.weeklyOffDay.replace(/;/g, ", ")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ShopTimings;
