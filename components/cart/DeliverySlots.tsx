import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface DeliverySlotsProps {
  deliveryInfo: any;
  deliveryOption: string;
  selectedDate: Date;
  selectedSlot: string | null;
  onDateChange: (date: Date) => void;
  onSlotSelect: (slot: string) => void;
  onCalendarOpen: () => void;
  formatDate: (date: Date) => string;
  formatFullDate: (date: Date) => string;
  weeklyOffDay?: string;
  vendorConfig?: any;
}

const DeliverySlots = ({
  deliveryInfo,
  deliveryOption,
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotSelect,
  onCalendarOpen,
  formatDate,
  formatFullDate,
  weeklyOffDay = "",
  vendorConfig,
}: DeliverySlotsProps) => {
  if (!deliveryInfo || deliveryInfo.type === "membership") return null;

  // Helper function to check if a date is a weekly off day
  const isWeeklyOffDay = (date: Date): boolean => {
    if (!weeklyOffDay) return false;
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[date.getDay()];
    const offDays = weeklyOffDay
      .split(";")
      .map((day) => day.trim().toLowerCase());
    return offDays.includes(dayName.toLowerCase());
  };

  // Helper function to check if a date is in break time
  const isInBreakTime = (checkDate: Date): boolean => {
    if (!vendorConfig?.offHours?.start || !vendorConfig?.offHours?.end)
      return false;
    const now = new Date();
    // Only check break time for today
    if (checkDate.toDateString() !== now.toDateString()) return false;

    const currentTime = now.getHours() + now.getMinutes() / 60;
    const [offStartHour] = vendorConfig.offHours.start.split(":").map(Number);
    const offHoursStart =
      offStartHour + Number(vendorConfig.offHours.start.split(":")[1]) / 60;
    const [offEndHour] = vendorConfig.offHours.end.split(":").map(Number);
    const offHoursEnd =
      offEndHour + Number(vendorConfig.offHours.end.split(":")[1]) / 60;

    return currentTime >= offHoursStart && currentTime < offHoursEnd;
  };

  // Helper function to get unavailability reason
  const getUnavailableReason = (checkDate: Date): string | null => {
    if (isWeeklyOffDay(checkDate)) return "closed";
    if (isInBreakTime(checkDate)) return "closed";
    return null;
  };

  // Helper function to get next available non-off day date
  const getNextAvailableDate = (startDate: Date): Date => {
    const currentDate = new Date(startDate);
    while (isWeeklyOffDay(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return currentDate;
  };

  const handleTodayClick = () => {
    const today = getNextAvailableDate(new Date());
    onDateChange(today);
  };

  const handleTomorrowClick = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const availableTomorrow = getNextAvailableDate(tomorrow);
    onDateChange(availableTomorrow);
  };

  // Determine what to show on the second tab
  const getSecondTabLabel = () => {
    const selectedDateLabel = formatDate(selectedDate);
    if (selectedDateLabel === "Today") {
      return "Tomorrow";
    } else if (selectedDateLabel === "Tomorrow") {
      return "Tomorrow";
    } else {
      // Show the actual date (e.g., "Nov 30", "Dec 1")
      const date = selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return date;
    }
  };

  const isSecondTabActive = formatDate(selectedDate) !== "Today";

  // Check today's unavailability
  const today = new Date();
  const todayReason = getUnavailableReason(today);

  // Check tomorrow's unavailability
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowReason = getUnavailableReason(tomorrow);

  return (
    <View className="bg-white rounded-lg px-3 pb-6">
      {deliveryInfo.type === "hour" || deliveryInfo.type === "days" ? (
        <View>
          <View className="items-center">
            {deliveryInfo.type === "hour" && (
              <View className="items-center">
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="bicycle" size={20} color="#F97316" />
                  <Text className="text-base font-semibold text-gray-900">
                    Arriving Between
                  </Text>
                </View>
                <Text className="text-lg font-bold text-orange-600">
                  {deliveryInfo?.standard?.displayMessage}
                </Text>
              </View>
            )}
            {deliveryInfo.type === "days" && (
              <Text className="text-base font-semibold text-gray-900 text-center">
                Deliver {deliveryInfo?.standard?.displayMessage}
              </Text>
            )}
          </View>
        </View>
      ) : deliveryInfo.type === "slots" ? (
        <View>
          <View className="flex-row items-center mb-4">
            <Ionicons name="storefront" size={20} color="#F97316" />
            <Text className="text-lg font-bold text-gray-900 ml-2">
              {deliveryInfo.title}
            </Text>
          </View>

          {/* Date Selection */}
          <View className="flex-row gap-2 mb-4 bg-gray-200 rounded-lg p-1">
            <TouchableOpacity
              onPress={handleTodayClick}
              className={`flex-1 py-2 rounded-lg items-center ${
                formatDate(selectedDate) === "Today"
                  ? "bg-orange-500"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold text-center ${
                  formatDate(selectedDate) === "Today"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Today
              </Text>
              {todayReason && (
                <Text
                  className={`text-xs ${
                    formatDate(selectedDate) === "Today"
                      ? "text-white/80"
                      : "text-gray-500"
                  }`}
                >
                  ({todayReason})
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTomorrowClick}
              className={`flex-1 py-2 rounded-lg items-center ${
                isSecondTabActive ? "bg-orange-500" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold text-center ${
                  isSecondTabActive ? "text-white" : "text-gray-600"
                }`}
              >
                {getSecondTabLabel()}
              </Text>
              {tomorrowReason && isSecondTabActive && (
                <Text className="text-xs text-white/80">
                  ({tomorrowReason})
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Time Slots */}
          <View className="flex-row flex-wrap gap-2">
            {deliveryInfo.slots.length > 0 ? (
              deliveryInfo.slots.map((slot: string) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => onSlotSelect(slot)}
                  className={`flex-1 min-w-[45%] py-3 rounded-lg border-2 ${
                    selectedSlot === slot
                      ? "bg-green-50 border-green-600"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold text-center ${
                      selectedSlot === slot ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text className="text-sm text-gray-500 text-center w-full">
                {deliveryInfo.isWeeklyOff
                  ? "Shop is closed. Please select another date."
                  : `No available slots for ${formatDate(selectedDate)}.`}
              </Text>
            )}
          </View>

          {/* Calendar Button */}
          <TouchableOpacity
            onPress={onCalendarOpen}
            className="w-full mt-4 flex-row items-center justify-center gap-2 py-2"
          >
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text className="text-sm font-semibold text-gray-600">
              Selected: {formatFullDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default DeliverySlots;
