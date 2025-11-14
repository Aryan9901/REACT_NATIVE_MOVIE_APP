import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  availableFilters: Record<string, string[]>;
  activeFilters: Record<string, string[]>;
  onFilterChange: (
    filterKey: string,
    value: string,
    isChecked: boolean
  ) => void;
  onClearAll: () => void;
}

export default function FilterModal({
  visible,
  onClose,
  availableFilters,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterModalProps) {
  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce(
      (count, filterArray) => count + filterArray.length,
      0
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <Text className="text-lg font-bold">Filters</Text>
            <View className="flex-row items-center gap-3">
              {getActiveFilterCount() > 0 && (
                <TouchableOpacity onPress={onClearAll}>
                  <Text className="text-orange-600 font-semibold">
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Content */}
          <ScrollView className="px-4 py-3">
            {Object.entries(availableFilters).map(([filterKey, values]) => {
              if (!values || values.length === 0) return null;

              return (
                <View key={filterKey} className="mb-6">
                  <Text className="text-base font-bold text-gray-900 mb-3">
                    {filterKey === "brand" ? "Brand" : filterKey}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {values.map((value: string) => {
                      const isActive =
                        activeFilters[filterKey]?.includes(value) || false;

                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() =>
                            onFilterChange(filterKey, value, !isActive)
                          }
                          className={`px-4 py-2 rounded-full border ${
                            isActive
                              ? "bg-orange-500 border-orange-500"
                              : "bg-white border-gray-300"
                          }`}
                          activeOpacity={0.7}
                        >
                          <Text
                            className={`text-sm ${
                              isActive
                                ? "text-white font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {value}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Apply Button */}
          <View className="px-4 py-3 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="bg-orange-500 rounded-lg py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                Apply Filters
                {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
