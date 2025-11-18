import { formatAddress } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: any) => void;
  currentAddress: any;
  userAddresses: any[];
  onAddressValidation?: (address: any) => Promise<boolean>;
}

const AddressSelectModal = ({
  isOpen,
  onClose,
  onSelect,
  currentAddress,
  userAddresses,
  onAddressValidation,
}: AddressSelectModalProps) => {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState<string | null>(null);

  const handleAddNewAddress = () => {
    onClose();
    router.push("/profile/edit-address");
  };

  const handleSelectAddress = async (address: any) => {
    if (onAddressValidation) {
      setIsValidating(address.id);
      const isValid = await onAddressValidation(address);
      setIsValidating(null);

      if (isValid) {
        onSelect(address);
        onClose();
      }
    } else {
      onSelect(address);
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">
              Select Delivery Address
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Address List */}
          <ScrollView className="px-4 py-3" style={{ maxHeight: 400 }}>
            {userAddresses && userAddresses.length > 0 ? (
              userAddresses.map((address) => {
                const isSelected = currentAddress?.id === address?.id;
                return (
                  <TouchableOpacity
                    key={address.id}
                    onPress={() => handleSelectAddress(address)}
                    disabled={isValidating === address.id}
                    className={`flex-row items-start p-4 mb-3 rounded-xl border-2 ${
                      isSelected
                        ? "bg-orange-50 border-orange-500"
                        : "bg-white border-gray-200"
                    } ${isValidating === address.id ? "opacity-50" : ""}`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="location"
                      size={24}
                      color={isSelected ? "#F97316" : "#6B7280"}
                      style={{ marginTop: 2 }}
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className={`text-base font-bold mb-1 ${
                          isSelected ? "text-orange-600" : "text-gray-900"
                        }`}
                      >
                        {address.type || "Home"}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {formatAddress(address)}
                      </Text>
                    </View>
                    {isValidating === address.id ? (
                      <ActivityIndicator size="small" color="#F97316" />
                    ) : isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#F97316"
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="items-center justify-center py-16">
                <Ionicons name="location-outline" size={64} color="#9CA3AF" />
                <Text className="text-lg font-semibold text-gray-900 mt-4">
                  No Saved Addresses
                </Text>
                <Text className="text-gray-500 mt-2">
                  Add a new address to see it here
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="px-4 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleAddNewAddress}
              className="bg-orange-500 rounded-xl py-4 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Add New Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddressSelectModal;
