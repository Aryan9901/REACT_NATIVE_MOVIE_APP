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
}: CollectionSlotsProps) => {
  if (!collectionInfo) return null;

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
          onPress={() => onDateChange(new Date())}
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
          onPress={() => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            onDateChange(d);
          }}
          className={`flex-1 py-2 rounded-lg ${
            formatDate(selectedCollectionDate) === "Tomorrow"
              ? "bg-[#F77C06]"
              : "bg-transparent"
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-bold text-center ${
              formatDate(selectedCollectionDate) === "Tomorrow"
                ? "text-white"
                : "text-gray-600"
            }`}
          >
            Tomorrow
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCalendarOpen}
          className={`flex-1 py-2 rounded-lg flex-row items-center justify-center ${
            formatDate(selectedCollectionDate) !== "Tomorrow" &&
            formatDate(selectedCollectionDate) !== "Today"
              ? "bg-[#F77C06]"
              : "bg-transparent"
          }`}
          activeOpacity={0.7}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={
              formatDate(selectedCollectionDate) !== "Tomorrow" &&
              formatDate(selectedCollectionDate) !== "Today"
                ? "#fff"
                : "#4B5563"
            }
          />
          <Text
            className={`text-sm font-bold ml-1 ${
              formatDate(selectedCollectionDate) !== "Tomorrow" &&
              formatDate(selectedCollectionDate) !== "Today"
                ? "text-white"
                : "text-gray-600"
            }`}
          >
            Later
          </Text>
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
            No available slots for {formatDate(selectedCollectionDate)}.
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
