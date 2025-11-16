import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

interface VendorBusinessHoursProps {
  vendor: any;
}

export default function VendorBusinessHours({
  vendor,
}: VendorBusinessHoursProps) {
  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const parseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const addHour = (timeStr: string) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return "";
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours, 10);
    h = (h + 1) % 24;
    const newHours = h.toString().padStart(2, "0");
    return `${newHours}:${minutes}`;
  };

  const shopTiming = parseJSON(getAttributeValue("shopTiming"));
  const offHours = parseJSON(getAttributeValue("offHours"));
  const weeklyOffDays = (getAttributeValue("weeklyOffDay") || "")
    .split(";")
    .filter(Boolean)
    .map((d: string) => d.toLowerCase());

  const breakStartStr = offHours.start;
  const breakEndStr =
    offHours.end && /^\d{2}:\d{2}$/.test(offHours.end)
      ? offHours.end
      : addHour(breakStartStr);

  const openTime = formatTime(shopTiming.start);
  const closeTime = formatTime(shopTiming.end);
  const breakStart = formatTime(breakStartStr);
  const breakEnd = formatTime(breakEndStr);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const todayIndex = new Date().getDay();

  const schedule = daysOfWeek.map((day, index) => {
    const isToday = index === todayIndex;
    const isClosed = weeklyOffDays.includes(day.toLowerCase());

    return {
      day,
      isToday,
      isClosed,
      hours: isClosed ? "Closed" : `${openTime} - ${closeTime}`,
      break:
        !isClosed && breakStart ? `Break: ${breakStart} - ${breakEnd}` : null,
    };
  });

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-4">
      <View className="bg-white rounded-lg shadow-sm overflow-hidden">
        {schedule.map(({ day, isToday, isClosed, hours, break: breakInfo }) => (
          <View
            key={day}
            className={`flex-row items-center justify-between px-4 py-4 border-b border-gray-100 ${
              isToday ? "bg-orange-50" : ""
            }`}
          >
            <View className="flex-row items-center flex-1">
              {isToday && (
                <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
              )}
              <Text
                className={`text-sm font-semibold ${
                  isToday ? "text-orange-800" : "text-gray-800"
                }`}
              >
                {day}
              </Text>
            </View>

            <View className="flex-1 items-end">
              {isClosed ? (
                <View className="flex-row items-center">
                  <Ionicons name="close-circle" size={16} color="#DC2626" />
                  <Text className="text-sm font-semibold text-red-600 ml-1">
                    Closed
                  </Text>
                </View>
              ) : (
                <>
                  <Text className="text-sm font-medium text-gray-700">
                    {hours}
                  </Text>
                  {breakInfo && (
                    <Text className="text-xs text-amber-600 mt-1">
                      {breakInfo}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Additional Info */}
      <View className="mt-4 bg-blue-50 rounded-lg p-4">
        <View className="flex-row items-start">
          <Ionicons name="information-circle" size={20} color="#2563EB" />
          <Text className="text-xs text-blue-800 ml-2 flex-1">
            Business hours may vary on holidays. Please call ahead to confirm.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
