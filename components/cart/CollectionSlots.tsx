import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface CollectionSlotsProps {
  collectionInfo: any;
  selectedCollectionDate: Date;
  selectedCollectionSlot: string | null;
  onDateChange: (date: Date) => void;
  onSlotSelect: (slot: string) => void;
  onCalendarOpen: () => void;
  formatDate: (date: Date) => string;
  formatFullDate: (date: Date) => string;
  weeklyOffDay?: string;
}

const CollectionSlots = ({
  collectionInfo,
  selectedCollectionDate,
  selectedCollectionSlot,
  onDateChange,
  onSlotSelect,
  onCalendarOpen,
  formatDate,
  formatFullDate,
  weeklyOffDay = "",
}: CollectionSlotsProps) => {
  if (!collectionInfo) return null;

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
    const selectedDateLabel = formatDate(selectedCollectionDate);
    if (selectedDateLabel === "Today") {
      return "Tomorrow";
    } else if (selectedDateLabel === "Tomorrow") {
      return "Tomorrow";
    } else {
      // Show the actual date (e.g., "Nov 30", "Dec 1")
      const date = selectedCollectionDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return date;
    }
  };

  const isSecondTabActive = formatDate(selectedCollectionDate) !== "Today";

  return (
    <View className="bg-white rounded-lg mx-4 mb-3 p-4">
      <View className="flex-row items-center mb-4">
        <Ionicons name="storefront" size={20} color="#F77C06" />
        <Text className="text-lg font-bold text-gray-900 ml-2">
          {collectionInfo.title}
        </Text>
      </View>

      {/* Date Selection */}
      <View className="flex-row mb-4 bg-gray-300 rounded-lg">
        <TouchableOpacity
          onPress={handleTodayClick}
          className={`flex-1 py-2 rounded-lg ${
            formatDate(selectedCollectionDate) === "Today"
              ? "bg-[#F77C06]"
              : "bg-transparent"
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-bold text-center ${
              formatDate(selectedCollectionDate) === "Today"
                ? "text-white"
                : "text-gray-600"
            }`}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTomorrowClick}
          className={`flex-1 py-2 rounded-lg ${
            isSecondTabActive ? "bg-[#F77C06]" : "bg-transparent"
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-bold text-center ${
              isSecondTabActive ? "text-white" : "text-gray-600"
            }`}
          >
            {getSecondTabLabel()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCalendarOpen}
          className="flex-1 py-2 rounded-lg flex-row items-center justify-center bg-transparent"
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={16} color="#4B5563" />
          <Text className="text-sm font-bold ml-1 text-gray-600">Later</Text>
        </TouchableOpacity>
      </View>

      {/* Time Slots Grid */}
      <View className="flex-row flex-wrap gap-2">
        {collectionInfo.slots.length > 0 ? (
          collectionInfo.slots.map((slot: string) => (
            <TouchableOpacity
              key={slot}
              onPress={() => onSlotSelect(slot)}
              className={`py-2 px-2 rounded-lg border ${
                selectedCollectionSlot === slot
                  ? "bg-green-600 border-green-700"
                  : "bg-gray-300 border-gray-300"
              }`}
              style={{ minWidth: "22%" }}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-medium text-center ${
                  selectedCollectionSlot === slot
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-sm text-gray-500 text-center w-full">
            {collectionInfo.isWeeklyOff
              ? `Shop is closed on ${formatDate(
                  selectedCollectionDate
                )} (Weekly Off). Please select another date.`
              : `No available slots for ${formatDate(selectedCollectionDate)}.`}
          </Text>
        )}
      </View>

      {/* Selected Date Display */}
      <TouchableOpacity
        onPress={onCalendarOpen}
        className="w-full mt-4 mb-2 flex-row items-center justify-center gap-2"
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={16} color="#F77C06" />
        <Text className="text-sm font-semibold text-[#F77C06]">
          {formatFullDate(selectedCollectionDate)}, change
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CollectionSlots;
