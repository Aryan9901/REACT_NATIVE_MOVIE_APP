import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface SlotSelectionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SlotSelectionWarningModal = ({
  isOpen,
  onClose,
  message,
}: SlotSelectionWarningModalProps) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className="items-center gap-4">
            {/* Icon */}
            <View className="bg-orange-100 p-4 rounded-full">
              <Ionicons name="alert-circle" size={32} color="#EA580C" />
            </View>

            {/* Message */}
            <Text className="text-gray-800 text-base text-center">
              {message}
            </Text>

            {/* OK Button */}
            <TouchableOpacity
              onPress={onClose}
              className="w-full bg-orange-600 py-3 rounded-lg"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-base">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SlotSelectionWarningModal;
