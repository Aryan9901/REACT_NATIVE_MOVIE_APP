import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface VendorChangeModalProps {
  isOpen: boolean;
  onKeepAddress: () => void;
  onChangeVendor: () => void;
  vendorName: string;
}

const VendorChangeModal = ({
  isOpen,
  onKeepAddress,
  onChangeVendor,
  vendorName,
}: VendorChangeModalProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onKeepAddress}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-white rounded-2xl w-full max-w-md p-6">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center">
              <Ionicons name="alert-circle" size={32} color="#F97316" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Vendor Not Available
          </Text>

          {/* Message */}
          <Text className="text-gray-600 text-center mb-6">
            {vendorName} doesn't serve this location. You can keep your current
            address or select another vendor.
          </Text>

          {/* Buttons */}
          <View className="space-y-3">
            <TouchableOpacity
              onPress={onChangeVendor}
              className="bg-orange-500 rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">
                Select Another Vendor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onKeepAddress}
              className="bg-gray-100 rounded-xl py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 font-bold text-base">
                Keep Current Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default VendorChangeModal;
