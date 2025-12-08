import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface DeliveryOptionsProps {
  deliveryOption: string;
  onDeliveryOptionChange: (option: string) => void;
  showOptions: boolean;
  vendorConfig?: any;
  selectedSlot?: any;
  isDineInDisabled?: boolean;
}

const DeliveryOptions = ({
  deliveryOption,
  onDeliveryOptionChange,
  showOptions,
  vendorConfig,
  selectedSlot,
  isDineInDisabled = false,
}: DeliveryOptionsProps) => {
  if (!showOptions) return null;

  const deliveryLabel = vendorConfig?.deliveryLabel || "Home Delivery";
  const pickupLabel = vendorConfig?.pickupLabel || "Self Pickup";

  return (
    <View className="bg-white rounded-lg mb-1 px-3 pt-2 pb-4">
      <Text className="text-lg font-bold text-gray-900 mb-3">
        Delivery Method
      </Text>
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => onDeliveryOptionChange("Home Delivery")}
          className="flex-1 flex-row items-center mr-4"
          activeOpacity={0.7}
        >
          <View
            className={`w-6 h-6 rounded border-2 items-center justify-center mr-2 ${
              deliveryOption === "Home Delivery"
                ? "border-green-700 bg-green-600"
                : "border-gray-300 bg-white"
            }`}
          >
            {deliveryOption === "Home Delivery" && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Ionicons
            name="home"
            size={20}
            color={deliveryOption === "Home Delivery" ? "green" : "#6B7280"}
            style={{ marginRight: 6 }}
          />
          <Text
            className={`${
              deliveryOption === "Home Delivery"
                ? "text-green-800 font-semibold"
                : "text-gray-700 font-medium"
            } `}
          >
            {deliveryLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            !isDineInDisabled && onDeliveryOptionChange("Self Pickup")
          }
          disabled={isDineInDisabled}
          className={`flex-1 flex-row items-center ${
            isDineInDisabled ? "opacity-50" : ""
          }`}
          activeOpacity={0.7}
        >
          <View
            className={`w-6 h-6 rounded border-2 items-center justify-center mr-2 ${
              isDineInDisabled
                ? "border-gray-300 bg-gray-100"
                : deliveryOption === "Self Pickup"
                ? "border-green-700 bg-green-600"
                : "border-gray-300 bg-white"
            }`}
          >
            {deliveryOption === "Self Pickup" && !isDineInDisabled && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Ionicons
            name="storefront"
            size={20}
            color={
              isDineInDisabled
                ? "#9CA3AF"
                : deliveryOption === "Self Pickup"
                ? "green"
                : "#6B7280"
            }
            style={{ marginRight: 6 }}
          />
          <View className="flex-row items-center">
            <Text
              className={`${
                isDineInDisabled
                  ? "text-gray-400 font-medium"
                  : deliveryOption === "Self Pickup"
                  ? "text-green-800 font-semibold"
                  : "text-gray-700 font-medium"
              } `}
            >
              {pickupLabel}
            </Text>
            {isDineInDisabled && (
              <Text className="text-xs text-gray-400 ml-1">(Closed)</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliveryOptions;
