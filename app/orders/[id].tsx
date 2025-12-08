import Header from "@/components/Header";
import { getStatusBadge, ORDER_ATTRIBUTE_KEYS } from "@/lib/constants";
import * as OrderService from "@/services/order";
import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LoadingState = () => (
  <View className="flex-1 items-center justify-center py-16">
    <ActivityIndicator size="large" color="#ea580c" />
    <Text className="text-lg font-semibold text-gray-900 mt-4">
      Loading Order Details
    </Text>
  </View>
);

// Order Tracking Component with improved logic
const OrderTracking = ({ order }: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Helper to get attribute values
  const getAttributeValue = (key: string) => {
    const attr = order?.attributeModels?.find((attr: any) => attr.name === key);
    return attr?.value;
  };

  // Build tracking steps dynamically based on order status
  const buildTrackingSteps = () => {
    const steps = [];
    const currentStatus = order?.status || "Pending";
    const isCancelled = currentStatus === "Cancelled";
    const isRescheduled = currentStatus === "Rescheduled";

    // Check which steps were completed
    const approvedOn = getAttributeValue("Approved On");
    const rescheduledOn = getAttributeValue("Rescheduled On");
    const outForDeliveryOn = getAttributeValue("Out For Delivery On");
    const deliveredOn = getAttributeValue("Delivered On");

    if (isCancelled) {
      // If cancelled, only show completed steps before cancellation
      // Step 1: Order Received (always shown as completed)
      steps.push({
        key: "Pending",
        title: "Received",
        icon: "shopping-cart",
        status: "completed",
        date: formatDate(getAttributeValue("Order Date") || order?.createdAt),
      });

      // Step 2: Accepted (only show if approved)
      if (approvedOn) {
        steps.push({
          key: "Accepted",
          title: "Accepted",
          icon: "check",
          status: "completed",
          date: formatDate(approvedOn),
        });
      }

      // Step 3: Rescheduled (only show if rescheduled)
      if (rescheduledOn) {
        steps.push({
          key: "Rescheduled",
          title: "Rescheduled",
          icon: "clockcircleo",
          status: "completed",
          date: formatDate(rescheduledOn),
        });
      }

      // Step 4: Out For Delivery (only show if out for delivery)
      if (outForDeliveryOn) {
        steps.push({
          key: "Out For Delivery",
          title: "Out For Delivery",
          icon: "car",
          status: "completed",
          date: formatDate(outForDeliveryOn),
        });
      }

      // Step 5: Delivered (only show if delivered)
      if (deliveredOn) {
        steps.push({
          key: "Delivered",
          title: "Delivered",
          icon: "check-circle",
          status: "completed",
          date: formatDate(deliveredOn),
        });
      }

      // Add cancelled step at the end
      steps.push({
        key: "Cancelled",
        title: "Cancelled",
        icon: "close",
        status: "cancelled",
        date: formatDate(getAttributeValue("Cancelled On") || order?.updatedAt),
      });
    } else {
      // If not cancelled, show all steps with appropriate status
      // Step 1: Order Received (always completed)
      steps.push({
        key: "Pending",
        title: "Received",
        icon: "shopping-cart",
        status: "completed",
        date: formatDate(getAttributeValue("Order Date") || order?.createdAt),
      });

      // Step 2: Accepted
      steps.push({
        key: "Accepted",
        title: "Accepted",
        icon: "check",
        status: approvedOn ? "completed" : "pending",
        date: approvedOn ? formatDate(approvedOn) : null,
      });

      // Step 3: Rescheduled (show if rescheduled or if it's the current status)
      if (isRescheduled || rescheduledOn) {
        steps.push({
          key: "Rescheduled",
          title: "Rescheduled",
          icon: "clockcircleo",
          status: rescheduledOn
            ? "completed"
            : isRescheduled
            ? "completed"
            : "pending",
          date: rescheduledOn ? formatDate(rescheduledOn) : null,
        });
      }

      // Step 4: Out For Delivery
      steps.push({
        key: "Out For Delivery",
        title: "Out For Delivery",
        icon: "car",
        status: outForDeliveryOn ? "completed" : "pending",
        date: outForDeliveryOn ? formatDate(outForDeliveryOn) : null,
      });

      // Step 5: Delivered
      steps.push({
        key: "Delivered",
        title: "Delivered",
        icon: "check-circle",
        status: deliveredOn ? "completed" : "pending",
        date: deliveredOn ? formatDate(deliveredOn) : null,
      });
    }

    return steps;
  };

  const trackingSteps = buildTrackingSteps();

  return (
    <View className="bg-white rounded-xl border border-gray-200 py-4 px-2 mb-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row w-full items-start" style={{ minWidth: 180 }}>
          {trackingSteps.map((step, index) => {
            const isLast = index === trackingSteps.length - 1;
            const isCancelled = step.status === "cancelled";
            const isCompleted = step.status === "completed";
            const isPending = step.status === "pending";

            return (
              <View key={step.key} className="items-center px-2">
                {/* Step Icon and Connector */}
                <View className="items-center mb-2 relative w-full">
                  {/* Connector Line Before */}
                  {index > 0 && (
                    <View
                      className={`absolute top-5 right-1/2 h-0.5 ${
                        isCompleted || isCancelled
                          ? isCancelled
                            ? "bg-red-500"
                            : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                      style={{ width: "100%", zIndex: 0 }}
                    />
                  )}

                  {/* Connector Line After */}
                  {!isLast && (
                    <View
                      className={`absolute top-5 left-1/2 h-0.5 ${
                        trackingSteps[index + 1]?.status === "completed"
                          ? "bg-green-500"
                          : trackingSteps[index + 1]?.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-gray-200"
                      }`}
                      style={{ width: "100%", zIndex: 0 }}
                    />
                  )}

                  {/* Icon Circle */}
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center z-10 ${
                      isCancelled
                        ? "bg-red-500"
                        : isCompleted
                        ? "bg-green-500"
                        : isPending
                        ? "bg-gray-200"
                        : "bg-orange-500"
                    }`}
                  >
                    <AntDesign
                      name={step.icon as any}
                      size={20}
                      color={isPending ? "#9ca3af" : "#ffffff"}
                    />
                  </View>
                </View>

                {/* Step Title */}
                <Text
                  className={`text-xs text-center font-medium mb-1 ${
                    isPending ? "text-gray-500" : "text-gray-900"
                  }`}
                  numberOfLines={2}
                >
                  {step.title}
                </Text>

                {/* Date and Time */}
                {step.date && (
                  <View className="mt-1">
                    <Text className="text-xs text-gray-600 text-center font-medium">
                      {step.date.date}
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      {step.date.time}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

// Helper function to extract address without name (address comes after \\n)
const getFormattedAddressFromString = (address: string | undefined) => {
  if (!address) return "";
  // Check if address contains \\n (escaped newline from API)
  if (address.includes("\\n")) {
    const parts = address.split("\\n");
    return parts.slice(1).join(", ").trim();
  }
  // Check for actual newline character
  if (address.includes("\n")) {
    const parts = address.split("\n");
    return parts.slice(1).join(", ").trim();
  }
  return address;
};

// Map Modal Component
const MapModal = ({ visible, onClose, order }: any) => {
  const formattedAddress = getFormattedAddressFromString(
    order?.deliveryAddress
  );

  const openInMaps = () => {
    const encodedAddress = encodeURIComponent(formattedAddress);

    if (Platform.OS === "ios") {
      Linking.openURL(`maps://app?daddr=${encodedAddress}`);
    } else {
      Linking.openURL(`google.navigation:q=${encodedAddress}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="bg-white rounded-t-3xl p-6 w-full">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Delivery Location
            </Text>
            <TouchableOpacity onPress={onClose}>
              <AntDesign name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <View className="flex-row items-start gap-2 mb-3">
              <MaterialIcons name="location-on" size={20} color="#ea580c" />
              <Text className="text-base text-gray-700 flex-1">
                {formattedAddress}
              </Text>
            </View>

            {order?.vendorAddress && (
              <View className="flex-row items-start gap-2 mb-3">
                <MaterialIcons name="store" size={20} color="#ea580c" />
                <Text className="text-sm text-gray-600 flex-1">
                  From: {order?.vendorAddress}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={openInMaps}
            className="bg-orange-600 py-4 rounded-lg items-center flex-row justify-center gap-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="directions" size={20} color="#ffffff" />
            <Text className="text-white font-semibold text-base">
              Get Directions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="mt-3 bg-gray-100 py-3 rounded-lg items-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Cancel Order Modal
const CancelOrderModal = ({
  visible,
  onClose,
  onConfirm,
  onReschedule,
  isLoading,
}: any) => {
  const [selectedReason, setSelectedReason] = useState("");

  const cancellationReasons = [
    "Ordered by mistake",
    "Changed my mind",
    "Found a better price elsewhere",
    "Delivery time is too long",
    "Product not available at location",
    "Payment issues",
    "Incorrect delivery address",
    "Duplicate order",
  ];

  const handleConfirm = () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a cancellation reason");
      return;
    }
    onConfirm(selectedReason);
  };

  const handleClose = () => {
    setSelectedReason("");
    onClose();
  };

  const handleReschedule = () => {
    setSelectedReason("");
    onClose();
    onReschedule();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="bg-white rounded-t-3xl p-6 w-full">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Cancel Order
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
              <AntDesign name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm text-gray-600 mb-4">
            Please select a reason for cancelling this order:
          </Text>

          <ScrollView className="max-h-96 mb-4">
            {cancellationReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setSelectedReason(reason)}
                className={`flex-row items-center p-3 mb-2 rounded-lg border ${
                  selectedReason === reason
                    ? "bg-orange-50 border-orange-500"
                    : "bg-white border-gray-200"
                }`}
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    selectedReason === reason
                      ? "border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedReason === reason && (
                    <View className="w-3 h-3 rounded-full bg-orange-500" />
                  )}
                </View>
                <Text
                  className={`text-base ${
                    selectedReason === reason
                      ? "text-orange-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-red-600 py-4 rounded-lg items-center mb-3"
            disabled={isLoading || !selectedReason}
            activeOpacity={0.7}
            style={{
              opacity: isLoading || !selectedReason ? 0.5 : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Confirm Cancellation
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReschedule}
            className="bg-orange-600 py-3 rounded-lg items-center flex-row justify-center gap-2 mb-3"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color="#ffffff"
            />
            <Text className="text-white font-semibold text-base">
              Reschedule Instead
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-100 py-3 rounded-lg items-center"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Reschedule Order Modal
const RescheduleOrderModal = ({
  visible,
  onClose,
  onConfirm,
  isLoading,
  vendorConfig,
  isService = false,
}: any) => {
  // Parse weekly off days
  const weeklyOffDays = vendorConfig?.weeklyOffDay || "";
  const offDays = weeklyOffDays
    ? weeklyOffDays.split(";").map((day: string) => day.trim().toLowerCase())
    : [];

  // Check if a date is a weekly off day
  const isWeeklyOffDay = (checkDate: Date) => {
    if (offDays.length === 0) return false;
    const dayName = checkDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    return offDays.includes(dayName);
  };

  // Find next available date (skip weekly off days)
  const getNextAvailableDate = (startDate: Date) => {
    const nextDate = new Date(startDate);
    let attempts = 0;
    const maxAttempts = 14;

    while (attempts < maxAttempts) {
      if (!isWeeklyOffDay(nextDate)) {
        return nextDate;
      }
      nextDate.setDate(nextDate.getDate() + 1);
      attempts++;
    }
    return startDate;
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getNextAvailableDate(getTomorrow())
  );
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<
    { value: string; label: string }[]
  >([]);

  const formatDisplayTime = (timeStr: string) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute || "0"));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getCurrentHour = () => new Date().getHours();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Generate 1-hour slots from shop timing
  const generateHourlySlots = (shopTiming: any, date: Date) => {
    if (!shopTiming?.start || !shopTiming?.end) {
      return [];
    }

    const [startHour] = shopTiming.start.split(":").map(Number);
    const [endHour] = shopTiming.end.split(":").map(Number);

    const isTodayDate = isToday(date);
    const currentHour = getCurrentHour();

    const slots: { value: string; label: string }[] = [];

    let effectiveStartHour = startHour;
    if (isTodayDate && currentHour >= startHour) {
      effectiveStartHour = currentHour + 1;
    }

    const effectiveEndHour = endHour < startHour ? endHour + 24 : endHour;

    for (let hour = effectiveStartHour; hour < effectiveEndHour; hour++) {
      const slotStartHour = hour % 24;
      const slotEndHour = (hour + 1) % 24;

      const slotValue = `${String(slotStartHour).padStart(2, "0")}:00-${String(
        slotEndHour
      ).padStart(2, "0")}:00`;
      const slotLabel = `${formatDisplayTime(
        `${slotStartHour}:00`
      )} - ${formatDisplayTime(`${slotEndHour}:00`)}`;

      slots.push({ value: slotValue, label: slotLabel });
    }

    return slots;
  };

  // Calculate available slots based on selected date and vendor config
  useEffect(() => {
    let formattedSlots: { value: string; label: string }[] = [];

    if (isWeeklyOffDay(selectedDate)) {
      setAvailableSlots([]);
      setSelectedSlot("");
      return;
    }

    if (isService && vendorConfig?.deliverySlots?.service) {
      const deliverySlots = vendorConfig.deliverySlots.service || [];
      const isTodayDate = isToday(selectedDate);

      const slots = isTodayDate
        ? deliverySlots.filter((slot: string) => {
            const slotHour = parseInt(slot.split(":")[0], 10);
            return slotHour > getCurrentHour();
          })
        : deliverySlots;

      formattedSlots = slots.map((slot: string) => {
        const [start, end] = slot.split("-");
        return {
          value: slot,
          label: `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`,
        };
      });
    } else if (!isService && vendorConfig?.shopTiming) {
      formattedSlots = generateHourlySlots(
        vendorConfig.shopTiming,
        selectedDate
      );
    }

    setAvailableSlots(formattedSlots);

    if (formattedSlots.length > 0) {
      setSelectedSlot(formattedSlots[0].value);
    } else {
      setSelectedSlot("");
    }
  }, [selectedDate, vendorConfig, isService]);

  // Generate next 7 available days
  const getNext7Days = () => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1);

    while (days.length < 7) {
      if (!isWeeklyOffDay(currentDate)) {
        days.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  };

  const availableDates = getNext7Days();

  const formatDateDisplay = (date: Date) => {
    const tomorrow = getTomorrow();

    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleConfirm = () => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a delivery date");
      return;
    }
    if (availableSlots.length > 0 && !selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }
    onConfirm(selectedDate, selectedSlot);
  };

  const handleClose = () => {
    setSelectedDate(getNextAvailableDate(getTomorrow()));
    setSelectedSlot("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 items-center justify-end">
        <View className="bg-white rounded-t-3xl p-6 w-full max-h-[90%]">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-bold text-gray-900">
                Reschedule Order
              </Text>
              <Text className="text-sm text-gray-500">
                Choose a new {isService ? "pickup" : "delivery"} date
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={isLoading}>
              <AntDesign name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="max-h-[70%]"
            showsVerticalScrollIndicator={false}
          >
            {/* Date Selection */}
            <Text className="text-sm font-medium text-gray-900 mb-2">
              {isService
                ? "Select New Pickup Date"
                : "Select New Delivery Date"}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {availableDates.map((date) => {
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    onPress={() => setSelectedDate(date)}
                    className={`mr-2 px-4 py-3 rounded-lg border ${
                      isSelected
                        ? "bg-orange-600 border-orange-600"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`text-sm font-medium text-center ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatDateDisplay(date)}
                    </Text>
                    <Text
                      className={`text-xs text-center mt-1 ${
                        isSelected ? "text-orange-100" : "text-gray-500"
                      }`}
                    >
                      {date.toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Date Display */}
            <View className="bg-gray-50 rounded-lg p-3 mb-4">
              <Text className="text-xs text-gray-600 text-center">
                Selected Date
              </Text>
              <Text className="text-sm font-medium text-gray-900 text-center">
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            {/* Time Slot Selection */}
            {availableSlots.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-900 mb-2">
                  {isService
                    ? "Select Pickup Time Slot"
                    : "Select Delivery Time Slot"}
                </Text>
                <View className="flex-row flex-wrap">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.value;
                    return (
                      <TouchableOpacity
                        key={slot.value}
                        onPress={() => setSelectedSlot(slot.value)}
                        className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                          isSelected
                            ? "bg-orange-600 border-orange-600"
                            : "bg-white border-gray-200"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* No slots available message */}
            {availableSlots.length === 0 && (
              <View
                className={`rounded-lg p-3 mb-4 ${
                  isWeeklyOffDay(selectedDate)
                    ? "bg-red-50 border border-red-200"
                    : "bg-yellow-50 border border-yellow-200"
                }`}
              >
                <Text
                  className={`text-sm text-center ${
                    isWeeklyOffDay(selectedDate)
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}
                >
                  {isWeeklyOffDay(selectedDate)
                    ? `${selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                      })} is a weekly off day. Please choose another date.`
                    : isService
                    ? "No pickup slots available for the selected date."
                    : "No delivery slots available for the selected date."}
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={handleConfirm}
            className="bg-orange-600 py-4 rounded-lg items-center mb-3"
            disabled={
              isLoading ||
              !selectedDate ||
              (availableSlots.length > 0 && !selectedSlot)
            }
            activeOpacity={0.7}
            style={{
              opacity:
                isLoading ||
                !selectedDate ||
                (availableSlots.length > 0 && !selectedSlot)
                  ? 0.5
                  : 1,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Confirm Reschedule
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClose}
            className="bg-gray-100 py-3 rounded-lg items-center"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function OrderDetailsPage() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const data = await OrderService.fetchOrderDetails(id as string);
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (cancellationReason: string) => {
    try {
      setIsUpdatingOrder(true);
      const success = await OrderService.cancelOrder(
        id as string,
        cancellationReason,
        order?.attributeModels
      );
      setIsCancelModalOpen(false);
      if (success) {
        Alert.alert("Success", "Order cancelled successfully");
        fetchOrderDetails(); // Refresh order details
      } else {
        Alert.alert("Error", "Failed to cancel order. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Error", "Failed to cancel order. Please try again.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleRescheduleOrder = async (
    newDeliveryDate: Date,
    selectedSlot?: string
  ) => {
    try {
      setIsUpdatingOrder(true);
      const isServiceOrder = getAttributeValue("Is Service") === "true";
      const success = await OrderService.rescheduleOrder(
        id as string,
        newDeliveryDate,
        order?.attributeModels,
        selectedSlot,
        isServiceOrder
      );
      setIsRescheduleModalOpen(false);
      if (success) {
        Alert.alert("Success", "Order rescheduled successfully");
        fetchOrderDetails();
      } else {
        Alert.alert("Error", "Failed to reschedule order. Please try again.");
      }
    } catch (error) {
      console.error("Error rescheduling order:", error);
      Alert.alert("Error", "Failed to reschedule order. Please try again.");
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleCallVendor = () => {
    if (order?.vendorContactNo) {
      Linking.openURL(`tel:${order.vendorContactNo}`);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header />
        <LoadingState />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50">
        <Header />
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons
            name="package-variant-closed-remove"
            size={64}
            color="#9ca3af"
          />
          <Text className="text-xl font-bold text-gray-900 mt-4">
            Order Not Found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 bg-orange-600 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Helper function to get attribute values
  const getAttributeValue = (key: string) => {
    const attr = order?.attributeModels?.find((attr: any) => attr.name === key);
    return attr?.value;
  };

  const statusBadge = getStatusBadge(order.status);
  const deliveryCharges = parseFloat(
    getAttributeValue("Delivery Charge") || "0"
  );

  // Use order.items instead of order.products
  const displayItems = order?.items || [];

  // Calculate subtotal as mrp - discount for each item
  const subtotal = order?.mrp - order?.discount;

  const paymentMethod = getAttributeValue("Payment Method");
  const isPayOnDelivery = paymentMethod === "Pay On Delivery";
  const isPaid =
    order?.paymentStatus === "paid" || order?.paymentStatus === "verified";

  // Get dates from attributes
  const orderDate = getAttributeValue("Order Date");
  const deliveryTime = getAttributeValue("Delivery Time");
  const deliveryMethod = getAttributeValue("Delivery Method");

  const isDineIn = getAttributeValue(ORDER_ATTRIBUTE_KEYS.TABLE_NUMBER);

  // Helper function to extract address without name (address comes after \\n)
  const getFormattedAddress = (address: string | undefined) => {
    if (!address) return "";
    // Check if address contains \\n (escaped newline from API)
    if (address.includes("\\n")) {
      const parts = address.split("\\n");
      // Return everything after the first part (name)
      return parts.slice(1).join(", ").trim();
    }
    // Check for actual newline character
    if (address.includes("\n")) {
      const parts = address.split("\n");
      return parts.slice(1).join(", ").trim();
    }
    return address;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView className="flex-1">
        <View className="px-4 pt-3 pb-6">
          {/* Order Tracking */}
          <OrderTracking order={order} />

          {/* Order Header */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={() => router.back()} className="mr-2">
                <Ionicons name="chevron-back" size={24} color="#111827" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900 flex-1">
                Order #{order.orderId}
              </Text>
              <View className={`px-3 py-1.5 rounded-full ${statusBadge.bg}`}>
                <Text className={`text-xs font-medium ${statusBadge.text}`}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>

            <View className="space-y-2">
              <View className="flex items-center justify-between flex-row">
                {isDineIn && (
                  <View className="bg-orange-50 px-3 py-1.5 rounded-full self-start mb-2">
                    <Text className="text-sm font-semibold text-orange-600">
                      🪑 Table No {isDineIn}
                    </Text>
                  </View>
                )}
              </View>
              {order.vendorShopName && (
                <View className="bg-orange-50 px-3 py-1.5 rounded-full self-start mb-2">
                  <Text className="text-xs font-medium text-orange-600">
                    {order.vendorShopName}
                  </Text>
                </View>
              )}

              {order.vendorContactNo && (
                <TouchableOpacity
                  onPress={handleCallVendor}
                  className="flex-row items-center gap-2 mb-2"
                >
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-900 font-medium">
                    {order.vendorContactNo}
                  </Text>
                  <View className="bg-green-600 px-3 py-1 rounded-full ml-2">
                    <Text className="text-white text-xs font-semibold">
                      Call
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {deliveryTime && !isDineIn && (
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialCommunityIcons
                    name="truck-delivery"
                    size={16}
                    color="#6b7280"
                  />
                  <Text className="text-sm text-gray-600">{deliveryTime}</Text>
                </View>
              )}

              {!isDineIn && order.deliveryAddress && (
                <TouchableOpacity
                  onPress={() => setIsMapModalOpen(true)}
                  className="flex-row items-start gap-2 bg-gray-50 p-3 rounded-lg"
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="location-on" size={16} color="#ea580c" />
                  <Text className="text-sm text-gray-700 flex-1">
                    {getFormattedAddress(order.deliveryAddress)}
                  </Text>
                  <MaterialIcons name="directions" size={16} color="#ea580c" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Products/Cart Items */}
          {displayItems && displayItems.length > 0 && (
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-gray-900">
                  Cart Items ({displayItems.length})
                </Text>
                <MaterialCommunityIcons
                  name="cart-outline"
                  size={20}
                  color="#ea580c"
                />
              </View>
              {displayItems.map((item: any, index: number) => {
                const itemMrp = item.mrp || 0;
                const itemDiscount = item.discount || 0;
                const itemNetPrice = itemMrp - itemDiscount;

                return (
                  <View
                    key={index}
                    className={`flex-row items-start gap-3 pt-3 pb-1 ${
                      index !== displayItems.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    {item.productImageUrls?.[0] ? (
                      <Image
                        source={{ uri: item.productImageUrls[0] }}
                        className="w-16 h-16 rounded-lg border border-gray-200"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 items-center justify-center">
                        <MaterialCommunityIcons
                          name="image-off"
                          size={24}
                          color="#9ca3af"
                        />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900 mb-1">
                        {item.productName}
                      </Text>
                      <View className="flex flex-row gap-2 items-center ">
                        <Text className="text-sm text-gray-500">
                          {item.variant && `${item.variant} `}
                          {item.unit && `${item.unit} `}
                          {item.quantity && `× ${item.quantity}`}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <FontAwesome5
                            name="rupee-sign"
                            size={12}
                            color="#6b7280"
                          />
                          <Text className="text-sm text-gray-600">
                            {itemNetPrice} each
                          </Text>
                        </View>
                      </View>
                      {itemDiscount > 0 && (
                        <View className="flex-row items-center gap-2 mt-1">
                          <Text className="text-xs text-gray-400 line-through">
                            ₹{itemMrp}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="items-end">
                      <View className="flex-row items-center gap-1">
                        <FontAwesome5
                          name="rupee-sign"
                          size={14}
                          color="#4b5563"
                        />
                        <Text className="text-base font-semibold text-gray-900">
                          {itemNetPrice * (item.quantity || 1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Order Summary */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">
                Order Summary
              </Text>
              {isPayOnDelivery ? (
                <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-red-50">
                  <View className="w-2 h-2 bg-red-500 rounded-full" />
                  <Text className="text-xs font-medium text-red-700">
                    Payment Due
                  </Text>
                </View>
              ) : (
                isPaid && (
                  <View className="flex-row items-center gap-2 px-3 py-1 rounded-full bg-green-50">
                    <View className="w-2 h-2 bg-green-500 rounded-full" />
                    <Text className="text-xs font-medium text-green-700">
                      Paid
                    </Text>
                  </View>
                )
              )}
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base text-gray-600">Subtotal</Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm text-gray-500">
                    {displayItems.length || 0} items •
                  </Text>
                  <FontAwesome5 name="rupee-sign" size={14} color="#4b5563" />
                  <Text className="text-base font-medium text-gray-900">
                    {subtotal}
                  </Text>
                </View>
              </View>

              {!isDineIn && (
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base text-gray-600">
                    Delivery Charges
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <FontAwesome5 name="rupee-sign" size={14} color="#4b5563" />
                    <Text className="text-base font-medium text-gray-900">
                      {deliveryCharges}
                    </Text>
                  </View>
                </View>
              )}

              <View className="border-t border-gray-200 pt-3 mt-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xl font-bold text-gray-900">Total</Text>
                  <View className="flex-row items-center gap-1">
                    <FontAwesome5 name="rupee-sign" size={18} color="#ea580c" />
                    <Text className="text-2xl font-bold text-orange-600">
                      {order.total}
                    </Text>
                  </View>
                </View>
                {!isDineIn && (
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-gray-600 font-medium">
                      Delivery Method
                    </Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {deliveryMethod || "Standard Delivery"}
                    </Text>
                  </View>
                )}

                {!isDineIn && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600 font-medium">
                      Payment Method
                    </Text>
                    <View className="flex-row items-center gap-2">
                      {isPayOnDelivery ? (
                        <>
                          <MaterialCommunityIcons
                            name="truck"
                            size={20}
                            color="#16a34a"
                          />
                          <Text className="text-sm font-medium text-gray-900">
                            Pay On Delivery
                          </Text>
                        </>
                      ) : isPaid ? (
                        <>
                          <MaterialIcons
                            name="payment"
                            size={20}
                            color="#16a34a"
                          />
                          <Text className="text-sm font-medium text-gray-900">
                            PAID
                          </Text>
                        </>
                      ) : (
                        <Text className="text-sm font-medium text-gray-900">
                          {paymentMethod || "N/A"}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Cancellation Reason */}
          {order.status === "Cancelled" && order.note ? (
            <View className="bg-red-50 rounded-xl border border-red-200 p-4 mb-2">
              <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="info" size={16} color="#dc2626" />
                <Text className="text-base font-semibold text-red-900">
                  Cancellation Reason
                </Text>
              </View>
              <Text className="text-sm text-red-700 leading-relaxed">
                {order?.note}
              </Text>
            </View>
          ) : order?.note ? (
            <View className="bg-white rounded-xl border border-gray-200 p-4 mb-2">
              <Text className="text-base font-semibold text-gray-900 mb-2">
                Order Note
              </Text>
              <Text className="text-sm text-gray-700 leading-relaxed">
                {order.note}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            {["Pending", "Accepted", "Rescheduled"].includes(order.status) &&
              !isDineIn && (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setIsRescheduleModalOpen(true)}
                    className="flex-1 bg-orange-600 py-3 rounded-lg items-center flex-row justify-center gap-2"
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={20}
                      color="#ffffff"
                    />
                    <Text className="text-white font-semibold text-base">
                      Reschedule
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsCancelModalOpen(true)}
                    className="flex-1 bg-red-600 py-3 rounded-lg items-center"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-semibold text-base">
                      Cancel Order
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-300 py-3 rounded-lg items-center"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-semibold text-base">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CancelOrderModal
        visible={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelOrder}
        onReschedule={() => setIsRescheduleModalOpen(true)}
        isLoading={isUpdatingOrder}
      />

      <RescheduleOrderModal
        visible={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onConfirm={handleRescheduleOrder}
        isLoading={isUpdatingOrder}
        vendorConfig={{
          deliverySlots: (() => {
            const deliverySlotsAttr = order?.attributeModels?.find(
              (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.DELIVERY_SLOTS
            );
            return deliverySlotsAttr?.value
              ? JSON.parse(deliverySlotsAttr.value)
              : {};
          })(),
          shopTiming: (() => {
            const shopTimingAttr = order?.attributeModels?.find(
              (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.SHOP_TIMING
            );
            return shopTimingAttr?.value
              ? JSON.parse(shopTimingAttr.value)
              : { start: "08:00", end: "20:00" };
          })(),
          weeklyOffDay: (() => {
            const weeklyOffAttr = order?.attributeModels?.find(
              (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.WEEKLY_OFF_DAY
            );
            return weeklyOffAttr?.value || "";
          })(),
        }}
        isService={getAttributeValue("Is Service") === "true"}
      />

      <MapModal
        visible={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        order={order}
      />
    </View>
  );
}
