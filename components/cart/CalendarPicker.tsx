import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface CalendarPickerProps {
  onSelect: (date: Date) => void;
  onClose: () => void;
  selectedDate: Date;
}

const CalendarPicker = ({
  onSelect,
  onClose,
  selectedDate,
}: CalendarPickerProps) => {
  const [date, setDate] = useState(selectedDate || new Date());

  const handlePrevMonth = () =>
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));

  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).getDay();

  const today = new Date();
  const tempDate = new Date();
  const lastDate = new Date(tempDate.setDate(tempDate.getDate() + 6));
  today.setHours(0, 0, 0, 0);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 w-11/12 max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-bold text-lg text-gray-900">
              {date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handlePrevMonth}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="chevron-back" size={20} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <Ionicons name="chevron-forward" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Day Headers */}
          <View className="flex-row mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className="text-sm text-gray-500">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <ScrollView className="max-h-64">
            <View className="flex-row flex-wrap">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <View key={`empty-${i}`} className="w-[14.28%] p-1" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, day) => {
                const dayDate = new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  day + 1
                );
                const isPast = dayDate < today;
                const isFuture = dayDate >= lastDate;
                const isSelected =
                  selectedDate &&
                  dayDate.toDateString() === selectedDate.toDateString();

                return (
                  <View key={day} className="w-[14.28%] p-1">
                    <TouchableOpacity
                      disabled={isPast || isFuture}
                      onPress={() => onSelect(dayDate)}
                      className={`aspect-square items-center justify-center rounded-full ${
                        isPast || isFuture
                          ? "bg-gray-100"
                          : isSelected
                          ? "bg-green-600"
                          : "bg-white"
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          isPast || isFuture
                            ? "text-gray-300"
                            : isSelected
                            ? "text-white font-bold"
                            : "text-gray-900"
                        }`}
                      >
                        {day + 1}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="w-full mt-4 p-3 bg-gray-100 rounded-lg items-center"
          >
            <Text className="font-semibold text-gray-700">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CalendarPicker;
