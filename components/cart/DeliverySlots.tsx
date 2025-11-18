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
}: DeliverySlotsProps) => {
  if (!deliveryInfo || deliveryInfo.type === "membership") return null;

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
              onPress={() => onDateChange(new Date())}
              className={`flex-1 py-2 rounded-lg ${
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
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                onDateChange(d);
              }}
              className={`flex-1 py-2 rounded-lg ${
                formatDate(selectedDate) === "Tomorrow"
                  ? "bg-orange-500"
                  : "bg-transparent"
              }`}
            >
              <Text
                className={`text-sm font-bold text-center ${
                  formatDate(selectedDate) === "Tomorrow"
                    ? "text-white"
                    : "text-gray-600"
                }`}
              >
                Tomorrow
              </Text>
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
                No available slots for {formatDate(selectedDate)}.
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
