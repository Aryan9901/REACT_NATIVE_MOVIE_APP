import AddressSelectModal from "@/components/cart/AddressSelectModal";
import CalendarPicker from "@/components/cart/CalendarPicker";
import CollectionSlots from "@/components/cart/CollectionSlots";
import DeliveryOptions from "@/components/cart/DeliveryOptions";
import DeliverySlots from "@/components/cart/DeliverySlots";
import OrderConfirmationModal from "@/components/cart/OrderConfirmationModal";
import PaymentMethod from "@/components/cart/PaymentMethod";
import ShopTimings from "@/components/cart/ShopTimings";
import SlotSelectionWarningModal from "@/components/cart/SlotSelectionWarningModal";
import VendorChangeModal from "@/components/cart/VendorChangeModal";
import CartItems from "@/components/CartItems";
import EmptyCart from "@/components/EmptyCart";
import OrderSummary from "@/components/OrderSummary";
import {
  API_URL,
  PAYMENT_MODE,
  STORAGE_KEYS,
  USER_ROLES,
} from "@/lib/constants";
import { fetchNearbyVendors } from "@/services/vendor.service";
import { useAuthStore, useStoreStore } from "@/stores";
import {
  formatDate,
  formatFullDate,
  formatShortDate,
  formatTime,
  getCurrentHour,
} from "@/utils/dateUtils";
import { formatAddress } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VendorConfig {
  minimumOrder?: string;
  deliveryCharges?: string;
  productDeliveryType?: string;
  shopTiming?: { start: string; end: string };
  offHours?: { start: string; end: string };
  deliveryPreparationTime?: { product?: string };
  deliverySlots?: { service?: string[] };
  minDays?: string;
  maxDays?: string;
  deliveryMethod?: { product?: string };
  paymentMethod?: string;
}

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    cartItemCount,
    removeFromCart,
    deliveryLocation,
    selectedVendor,
    updateCartQuantity,
    clearCart,
  } = useStoreStore();
  const { user } = useAuthStore();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();

  const [vendorData, setVendorData] = useState<any>(null);
  const [deliveryOption, setDeliveryOption] = useState<string>("Home Delivery");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [notes, setNotes] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    PAYMENT_MODE.PAY_ON_DELIVERY
  );
  const [allowedPaymentMethods, setAllowedPaymentMethods] = useState<string[]>([
    "Pay On Delivery",
  ]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedCollectionDate, setSelectedCollectionDate] = useState<Date>(
    new Date()
  );
  const [selectedCollectionSlot, setSelectedCollectionSlot] = useState<
    string | null
  >(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [showSlotWarningModal, setShowSlotWarningModal] =
    useState<boolean>(false);
  const [slotWarningMessage, setSlotWarningMessage] = useState<string>("");
  const [showVendorChangeModal, setShowVendorChangeModal] =
    useState<boolean>(false);
  const [pendingAddress, setPendingAddress] = useState<any>(null);
  const [showOrderConfirmation, setShowOrderConfirmation] =
    useState<boolean>(false);
  const [orderConfirmationData, setOrderConfirmationData] = useState<any>(null);

  const handleIncrement = (variantId: string, currentQuantity: number) => {
    if (currentQuantity >= 9) return;
    updateCartQuantity(variantId, currentQuantity + 1);
  };

  const handleDecrement = (variantId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      removeFromCart(variantId);
    } else {
      updateCartQuantity(variantId, currentQuantity - 1);
    }
  };

  // Format time helper
  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Parse vendor configuration
  const vendorConfig = useMemo<VendorConfig>(() => {
    if (!vendorData || !vendorData.attributeValues) return {};
    const config: any = {};
    vendorData.attributeValues.forEach(
      (attr: { name: string; value: string }) => {
        try {
          config[attr.name] = JSON.parse(attr.value);
        } catch (e) {
          config[attr.name] = attr.value;
        }
      }
    );
    return config;
  }, [vendorData]);

  // Calculate order totals
  const {
    itemTotal,
    totalMrp,
    totalSavings,
    deliveryCharge,
    grandTotal,
    minimumOrderValue,
    isMinimumOrderMet,
    progress,
    isStrictMinimumOrderEnforced,
  } = useMemo(() => {
    if (
      !vendorConfig ||
      Object.keys(vendorConfig).length === 0 ||
      cart.length === 0
    ) {
      return {
        itemTotal: 0,
        totalMrp: 0,
        totalSavings: 0,
        deliveryCharge: 0,
        grandTotal: 0,
        minimumOrderValue: 0,
        isMinimumOrderMet: true,
        progress: 100,
        isStrictMinimumOrderEnforced: false,
      };
    }

    const itemTotalCalc = cart.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const totalMrpCalc = cart.reduce(
      (acc: number, item: any) =>
        acc + (item.mrp || item.price) * item.quantity,
      0
    );
    const totalSavingsCalc = totalMrpCalc - itemTotalCalc;
    const minimumOrderValueCalc = Number.parseFloat(
      vendorConfig.minimumOrder || "0"
    );
    const vendorDeliveryChargeCalc = Number.parseFloat(
      vendorConfig.deliveryCharges || "0"
    );
    const isPickup = deliveryOption === "Self Pickup";
    const isMinimumOrderMetCalc =
      isPickup || itemTotalCalc >= minimumOrderValueCalc;

    const isStrictMinimumOrderEnforcedCalc =
      !isPickup &&
      vendorDeliveryChargeCalc === 0 &&
      minimumOrderValueCalc > 0 &&
      itemTotalCalc < minimumOrderValueCalc;

    const progressCalc = isPickup
      ? 100
      : Math.min((itemTotalCalc / minimumOrderValueCalc) * 100, 100);

    const deliveryChargeCalc =
      deliveryOption === "Home Delivery"
        ? minimumOrderValueCalc > 0
          ? isMinimumOrderMetCalc
            ? 0
            : vendorDeliveryChargeCalc
          : vendorDeliveryChargeCalc
        : 0;

    const grandTotalCalc = itemTotalCalc + deliveryChargeCalc;

    return {
      itemTotal: itemTotalCalc,
      totalMrp: totalMrpCalc,
      totalSavings: totalSavingsCalc,
      deliveryCharge: deliveryChargeCalc,
      grandTotal: grandTotalCalc,
      minimumOrderValue: minimumOrderValueCalc,
      isMinimumOrderMet: isMinimumOrderMetCalc,
      progress: progressCalc,
      isStrictMinimumOrderEnforced: isStrictMinimumOrderEnforcedCalc,
    };
  }, [cart, vendorConfig, deliveryOption]);

  // Check if shop is open
  const isShopOpen = useMemo(() => {
    if (!vendorConfig.shopTiming?.start || !vendorConfig.shopTiming?.end)
      return false;

    const now = new Date();
    const currentTime = now.getHours() + now.getMinutes() / 60;

    const [startHour] = vendorConfig.shopTiming.start.split(":").map(Number);
    const startTime =
      startHour + Number(vendorConfig.shopTiming.start.split(":")[1]) / 60;

    const [endHour] = vendorConfig.shopTiming.end.split(":").map(Number);
    const endTime =
      endHour + Number(vendorConfig.shopTiming.end.split(":")[1]) / 60;

    const isOpenDuringOperatingHours =
      endTime > startTime
        ? currentTime >= startTime && currentTime < endTime
        : currentTime >= startTime || currentTime < endTime;

    // Check break time
    const offHoursStartStr = vendorConfig.offHours?.start;
    const offHoursEndStr = vendorConfig.offHours?.end;
    let isDuringBreak = false;

    if (offHoursStartStr && offHoursEndStr) {
      const [offStartHour] = offHoursStartStr.split(":").map(Number);
      const offHoursStart =
        offStartHour + Number(offHoursStartStr.split(":")[1]) / 60;
      const [offEndHour] = offHoursEndStr.split(":").map(Number);
      const offHoursEnd =
        offEndHour + Number(offHoursEndStr.split(":")[1]) / 60;
      isDuringBreak = currentTime >= offHoursStart && currentTime < offHoursEnd;
    }

    setIsBreakTime(isDuringBreak);
    return isOpenDuringOperatingHours && !isDuringBreak;
  }, [vendorConfig.shopTiming, vendorConfig.offHours]);

  // Load user and vendor data
  useEffect(() => {
    const loadData = async () => {
      try {
        selectedVendor;
        deliveryLocation;
        if (selectedVendor) {
          setVendorData(selectedVendor);
          const paymentOptions = selectedVendor?.attributeValues?.find(
            (attr: any) => attr?.name === "paymentMethod"
          )?.value;

          if (paymentOptions === "Both") {
            setAllowedPaymentMethods([
              PAYMENT_MODE.PAY_ON_DELIVERY,
              PAYMENT_MODE.PREPAID,
            ]);
          } else {
            setAllowedPaymentMethods([paymentOptions as any]);
          }
          // Set delivery address from vendor data
          if (deliveryLocation && deliveryLocation?.address) {
            setSelectedAddress(deliveryLocation.address);
          }
        }
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, [selectedVendor, deliveryLocation]);

  // Set delivery option based on vendor config
  useEffect(() => {
    if (
      vendorConfig.productDeliveryType &&
      vendorConfig.productDeliveryType !== "Both"
    ) {
      setDeliveryOption(vendorConfig.productDeliveryType);
    }
  }, [vendorConfig.productDeliveryType]);

  // Check if vendor has service collection
  const hasServiceCollection = !!vendorConfig?.deliverySlots?.service;

  // Calculate delivery info
  const deliveryInfo: any = useMemo(() => {
    const min = Number.parseInt(vendorConfig?.minDays || "0", 10);
    const max = Number.parseInt(vendorConfig?.maxDays || "0", 10);
    const method = vendorConfig.deliveryMethod?.product || "by hour";
    const preparationTime = vendorConfig?.deliveryPreparationTime;
    const serviceSlots = vendorConfig?.deliverySlots?.service || [];
    const serviceSlotsLength = serviceSlots?.length;
    const isSelfPickup = deliveryOption === "Self Pickup";

    if (
      !min &&
      !max &&
      !preparationTime?.product &&
      serviceSlotsLength < 1 &&
      !isSelfPickup
    ) {
      return {
        type: "membership",
        slots: [],
        shopTiming: vendorConfig.shopTiming,
        offHours: vendorConfig.offHours,
      };
    }

    if (deliveryOption === "Home Delivery") {
      if (!Number.isNaN(min) && !Number.isNaN(max) && max > 0 && max > min) {
        const todayForMin = new Date();
        const todayForMax = new Date();
        const minDeliveryDate = new Date(
          todayForMin.setDate(todayForMin.getDate() + min)
        );
        const maxDeliveryDate = new Date(
          todayForMax.setDate(todayForMax.getDate() + max)
        );
        const message = `Between ${formatShortDate(
          minDeliveryDate
        )} - ${formatShortDate(maxDeliveryDate)}`;
        return {
          type: "days",
          isService: false,
          standard: { message, displayMessage: message },
          shopTiming: vendorConfig.shopTiming,
          offHours: vendorConfig.offHours,
        };
      }

      if (method === "by hour") {
        const now = new Date();
        const [closingHour, closingMinute] = (
          vendorConfig.shopTiming?.end || "21:00"
        )
          .split(":")
          .map(Number);
        const [openingHour, openingMinute] = (
          vendorConfig.shopTiming?.start || "08:00"
        )
          .split(":")
          .map(Number);

        const openingTime = new Date(now);
        openingTime.setHours(openingHour, openingMinute, 0, 0);

        const closingTime = new Date(now);
        closingTime.setHours(closingHour, closingMinute, 0, 0);

        if (closingHour < openingHour) {
          if (now.getHours() < closingHour)
            openingTime.setDate(openingTime.getDate() - 1);
          else closingTime.setDate(closingTime.getDate() + 1);
        }

        const prepHours = Number.parseFloat(preparationTime?.product || "0");
        let startTimeWindow;
        let endTimeWindow;

        if (prepHours === 0.5) {
          startTimeWindow = new Date(now);
          startTimeWindow.setSeconds(0, 0);
          endTimeWindow = new Date(now.getTime() + 30 * 60 * 1000);
          endTimeWindow.setSeconds(0, 0);
        } else {
          startTimeWindow = new Date(now);
          if (
            startTimeWindow.getMinutes() > 0 ||
            startTimeWindow.getSeconds() > 0 ||
            startTimeWindow.getMilliseconds() > 0
          ) {
            startTimeWindow.setHours(startTimeWindow.getHours() + 1, 0, 0, 0);
          }
          endTimeWindow = new Date(
            startTimeWindow.getTime() + prepHours * 60 * 60 * 1000
          );
        }

        if (startTimeWindow < openingTime) {
          const nextOpeningTime = new Date(openingTime);
          const deliveryDate = new Date(
            nextOpeningTime.getTime() + prepHours * 60 * 60 * 1000
          );
          const message = `${formatTime(nextOpeningTime)} - ${formatTime(
            deliveryDate
          )}`;
          const displayMessage = `${message}, ${formatShortDate(deliveryDate)}`;
          return {
            type: "hour",
            isService: false,
            standard: { message, displayMessage, date: deliveryDate },
            shopTiming: vendorConfig.shopTiming,
            offHours: vendorConfig.offHours,
          };
        }

        if (startTimeWindow >= closingTime || endTimeWindow >= closingTime) {
          const nextOpeningTime = new Date(openingTime);
          if (nextOpeningTime <= now)
            nextOpeningTime.setDate(nextOpeningTime.getDate() + 1);
          const deliveryDate = new Date(
            nextOpeningTime.getTime() + prepHours * 60 * 60 * 1000
          );
          const message = `${formatTime(nextOpeningTime)} - ${formatTime(
            deliveryDate
          )}`;
          const displayMessage = `${message}, ${formatShortDate(deliveryDate)}`;
          return {
            type: "hour",
            isService: false,
            standard: { message, displayMessage, date: deliveryDate },
            shopTiming: vendorConfig.shopTiming,
            offHours: vendorConfig.offHours,
          };
        }

        if (
          endTimeWindow.getMinutes() > 0 ||
          endTimeWindow.getSeconds() > 0 ||
          endTimeWindow.getMilliseconds() > 0
        ) {
          endTimeWindow.setHours(endTimeWindow.getHours() + 1, 0, 0, 0);
        }

        let finalEndTime;
        if (endTimeWindow > closingTime) {
          finalEndTime = closingTime;
        } else {
          finalEndTime = endTimeWindow;
        }

        const message = `${formatTime(startTimeWindow)} - ${formatTime(
          finalEndTime
        )}`;
        const displayMessage = `${message}, ${formatShortDate(now)}`;
        return {
          type: "hour",
          standard: { message, displayMessage, date: now },
          shopTiming: vendorConfig.shopTiming,
          offHours: vendorConfig.offHours,
        };
      }
    }

    if (deliveryOption === "Self Pickup") {
      const { start: startTimeStr, end: endTimeStr } =
        vendorConfig.shopTiming || {};
      if (!startTimeStr || !endTimeStr) return { type: "none", slots: [] };

      const [startHour] = startTimeStr.split(":").map(Number);
      const [endHour] = endTimeStr.split(":").map(Number);
      const slots = [];
      const isToday = formatDate(selectedDate) === "Today";
      const currentHour = new Date().getHours();
      const loopStartHour = isToday
        ? Math.max(startHour, currentHour + 1)
        : startHour;
      const effectiveEndHour = endHour <= startHour ? endHour + 24 : endHour;

      const formatSlotTime = (hour: number) => {
        const displayHour = hour % 24;
        const date = new Date();
        date.setHours(displayHour, 0, 0, 0);
        return date
          .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
          .replace(" ", "");
      };

      for (let hour = loopStartHour; hour < effectiveEndHour; hour += 2) {
        const endOfSlotHour = Math.min(hour + 2, effectiveEndHour);
        if (endOfSlotHour - hour < 1) continue;
        slots.push(
          `${formatSlotTime(hour)} - ${formatSlotTime(endOfSlotHour)}`
        );
      }

      return {
        type: "slots",
        isService: hasServiceCollection,
        slots,
        title: "Schedule Pickup",
        shopTiming: vendorConfig.shopTiming,
        offHours: vendorConfig.offHours,
        noSlotsAvailableToday: isToday && slots.length === 0,
      };
    }

    return {
      type: "none",
      slots: [],
      shopTiming: vendorConfig.shopTiming,
      offHours: vendorConfig.offHours,
    };
  }, [vendorConfig, selectedDate, deliveryOption, hasServiceCollection]);

  // Calculate collection info
  const collectionInfo = useMemo(() => {
    if (!hasServiceCollection) {
      return null;
    }

    const deliverySlots = vendorConfig.deliverySlots?.service || [];
    const availableSlots =
      formatDate(selectedCollectionDate) === "Today"
        ? deliverySlots.filter(
            (slot: string) =>
              Number.parseInt(slot.split(":")[0], 10) > getCurrentHour()
          )
        : deliverySlots;

    const formattedSlots = availableSlots.map((slot: string) => {
      const [start, end] = slot.split("-");
      return `${formatDisplayTime(start)} - ${formatDisplayTime(end)}`;
    });

    return {
      slots: formattedSlots,
      title: "Schedule Collection",
    };
  }, [
    vendorConfig,
    selectedCollectionDate,
    deliveryOption,
    hasServiceCollection,
  ]);

  const handlePlaceOrder = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isCombinedPickup =
      deliveryOption === "Self Pickup" && hasServiceCollection;
    const isMembership = deliveryInfo.type === "membership";

    // Check for self pickup slot selection
    if (deliveryOption === "Self Pickup" && !isMembership && !selectedSlot) {
      setSlotWarningMessage("Please select a pickup time slot to continue.");
      setShowSlotWarningModal(true);
      return;
    }

    if (isCombinedPickup) {
      if (!selectedCollectionSlot) {
        setSlotWarningMessage("Please select a collection time slot.");
        setShowSlotWarningModal(true);
        return;
      }
    } else {
      if (
        !isMembership &&
        deliveryOption === "Home Delivery" &&
        !selectedSlot &&
        deliveryInfo.type === "slots"
      ) {
        setSlotWarningMessage("Please select a delivery time slot.");
        setShowSlotWarningModal(true);
        return;
      }
      if (!isMembership && hasServiceCollection && !selectedCollectionSlot) {
        setSlotWarningMessage("Please select a collection time slot.");
        setShowSlotWarningModal(true);
        return;
      }
    }

    if (isStrictMinimumOrderEnforced) {
      Alert.alert(
        "Minimum Order Not Met",
        `Please add items worth ₹${(minimumOrderValue - itemTotal).toFixed(
          2
        )} more to place the order.`
      );
      return;
    }

    if (deliveryOption === "Home Delivery" && !selectedAddress?.id) {
      setIsAddressModalOpen(true);
      return;
    }

    try {
      const userId = user?.id;

      let deliveryTime = "";
      let collectionTime = "";

      if (!isMembership) {
        if (deliveryInfo.type === "days" || deliveryInfo.type === "hour") {
          deliveryTime = deliveryInfo.standard.displayMessage;
        } else if (selectedSlot) {
          deliveryTime = `Between ${selectedSlot} on ${formatFullDate(
            selectedDate
          )}`;
        }

        if (hasServiceCollection && selectedCollectionSlot) {
          collectionTime = `${selectedCollectionSlot} on ${formatFullDate(
            selectedCollectionDate
          )}`;
        }
      }

      const cartItems = cart?.map((item) => {
        return {
          productId: item?.productId,
          productName: item?.name,
          productImageUrls: [item?.productImageUrls],
          quantity: item?.quantity,
          variant: item?.variant,
          variantId: item?.variantId,
          unit: item?.unit,
          mrp: item?.mrp,
          netPrice: item?.price,
        };
      });

      const orderPayload = {
        mrp: totalMrp,
        discount: totalSavings,
        total: grandTotal,
        contactNo: vendorData?.contactNo || "",
        deliveryAddress:
          deliveryOption === "Home Delivery"
            ? String(formatAddress(selectedAddress) || "")
            : String(vendorData?.address || ""),
        note: notes || "",
        items: cartItems,
        attributeModels: [
          {
            name: "Delivery Charge",
            value: isMembership ? "0" : deliveryCharge.toString(),
          },
          { name: "Delivery Method", value: deliveryOption },
          { name: "Delivery Time", value: deliveryTime },
          { name: "Order Date", value: new Date().toISOString() },
          { name: "Payment Method", value: paymentMethod },
          { name: "Delivered On", value: "" },
          {
            name: "IS_SERVICE",
            value: hasServiceCollection ? "true" : "false",
          },
          { name: "Subscribed On", value: "" },
          { name: "Rescheduled On", value: "" },
          { name: "Approved On", value: "" },
          { name: "Out For Delivery On", value: "" },
          { name: "Paid On", value: "" },
          { name: "Cancelled On", value: "" },
          ...(collectionTime
            ? [{ name: "Service Pickup Time", value: collectionTime }]
            : []),
        ],
      };

      setIsPlacingOrder(true);
      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );

      const response = await axios.post(
        `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order?addressId=${
          selectedAddress?.id || ""
        }`,
        orderPayload,
        {
          headers: {
            sessionToken: sessionToken || "",
            "X-USER-ROLE": USER_ROLES.USER,
            "X-User-Id": userId || "",
            "X-Vendor-Id": vendorData?.vendorId || vendorData?.id,
          },
        }
      );

      // Show order confirmation modal first
      setOrderConfirmationData({
        orderId: response.data?.id || response.data?.orderId || "N/A",
        total: `₹${grandTotal.toFixed(2)}`,
        estimatedDelivery: deliveryTime || "As per schedule",
        vendorName: vendorData?.shopName || vendorData?.name || "Vendor",
        vendorContact: vendorData?.contactNo || "",
        vendorAlternateContact: vendorData?.alternateContactNo || "",
        paymentStatus:
          paymentMethod === PAYMENT_MODE.PREPAID ? "Paid" : "Pay on Delivery",
      });
      setIsPlacingOrder(false);
      setShowOrderConfirmation(true);
    } catch (error: any) {
      console.error("Error placing order:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to place order. Please try again.";

      Alert.alert("Error", errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Auto-select delivery slot if type is hour or days
  useEffect(() => {
    if (deliveryInfo.type === "hour" || deliveryInfo.type === "days") {
      setSelectedSlot(deliveryInfo.standard.displayMessage);
    } else {
      setSelectedSlot(null);
    }
  }, [deliveryInfo]);

  // Auto-select tomorrow if no slots available today for self pickup
  useEffect(() => {
    if (
      deliveryOption === "Self Pickup" &&
      deliveryInfo.type === "slots" &&
      deliveryInfo.noSlotsAvailableToday &&
      formatDate(selectedDate) === "Today"
    ) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  }, [deliveryInfo, deliveryOption, selectedDate]);

  // Validate address change
  const handleAddressValidation = async (newAddress: any): Promise<boolean> => {
    try {
      if (!newAddress?.latitude || !newAddress?.longitude) {
        Alert.alert("Error", "Invalid address coordinates");
        return false;
      }

      const result = await fetchNearbyVendors(
        newAddress.latitude,
        newAddress.longitude,
        user
      );

      if (!result) {
        Alert.alert("Error", "Failed to check vendor availability");
        return false;
      }

      const nearbyVendors = result;
      const currentVendorId = selectedVendor?.id;

      if (!nearbyVendors) {
        setPendingAddress(newAddress);
        setIsAddressModalOpen(false);
        setShowVendorChangeModal(true);
        return false;
      }

      // Check if current vendor serves this location
      const vendorServesLocation = nearbyVendors.some(
        (vendor: any) => vendor.id === currentVendorId
      );

      if (!vendorServesLocation) {
        // Show vendor change modal
        setPendingAddress(newAddress);
        setIsAddressModalOpen(false);
        setShowVendorChangeModal(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating address:", error);
      Alert.alert("Error", "Failed to validate address");
      return false;
    }
  };

  // Set delivery option based on vendor config
  useEffect(() => {
    if (
      vendorConfig.productDeliveryType &&
      vendorConfig.productDeliveryType !== "Both"
    ) {
      setDeliveryOption(vendorConfig.productDeliveryType);
    }
  }, [vendorConfig.productDeliveryType]);

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-2 pb-2 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-4">
              Checkout ({cartItemCount} items)
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Clear Cart", "Remove all items from cart?", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", onPress: clearCart, style: "destructive" },
              ]);
            }}
          >
            <Text className="text-red-600 font-semibold">Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <CartItems
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
        />

        {/* Order Summary */}
        <OrderSummary
          orderSummary={{
            itemTotal,
            totalSavings,
            deliveryCharge,
            isStrictMinimumOrderEnforced,
            isMinimumOrderMet,
            minimumOrderValue,
            grandTotal,
            progress,
          }}
        />
        <View className="px-2 mb-2">
          <View className="bg-white shadow-lg rounded-md">
            {/* Delivery Options */}
            <DeliveryOptions
              deliveryOption={deliveryOption}
              onDeliveryOptionChange={setDeliveryOption}
              showOptions={vendorConfig.productDeliveryType === "Both"}
            />

            {/* Delivery Slots */}
            {!hasServiceCollection && deliveryInfo?.type !== "membership" && (
              <DeliverySlots
                deliveryInfo={deliveryInfo}
                deliveryOption={deliveryOption}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateChange={setSelectedDate}
                onSlotSelect={setSelectedSlot}
                onCalendarOpen={() => setIsCalendarOpen(true)}
                formatDate={formatDate}
                formatFullDate={formatFullDate}
              />
            )}

            {/* Collection Slots */}
            {collectionInfo && deliveryInfo?.type !== "membership" && (
              <CollectionSlots
                collectionInfo={collectionInfo}
                selectedCollectionDate={selectedCollectionDate}
                selectedCollectionSlot={selectedCollectionSlot}
                onDateChange={setSelectedCollectionDate}
                onSlotSelect={setSelectedCollectionSlot}
                onCalendarOpen={() => setIsCalendarOpen(true)}
                formatDate={formatDate}
                formatFullDate={formatFullDate}
              />
            )}
          </View>
        </View>

        {/* Delivery Address */}
        <View className="bg-white rounded-md mx-2 mb-1 shadow-lg py-3 px-2">
          <Text className="text-lg font-bold mb-1 text-gray-900">
            {deliveryOption === "Home Delivery"
              ? "Delivery Address"
              : "Pickup From"}
          </Text>
          {deliveryOption === "Home Delivery" ? (
            <View>
              <View className="flex-row items-start mb-3">
                <Ionicons
                  name="location"
                  size={20}
                  color="#F97316"
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1 ml-2">
                  {selectedAddress ? (
                    <Text className="text-gray-700">
                      {String(formatAddress(selectedAddress))}
                    </Text>
                  ) : (
                    <Text className="text-gray-500">No address selected</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddressModalOpen(true)}
                className="bg-orange-500 rounded-lg py-3 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">
                  {selectedAddress ? "Change Address" : "Select Address"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-start">
              <Ionicons
                name="storefront"
                size={20}
                color="#F97316"
                style={{ marginTop: 2 }}
              />
              <Text className="flex-1 ml-2 text-gray-700">
                {typeof vendorData?.address === "string"
                  ? vendorData.address
                  : formatAddress(vendorData?.address) || "Vendor address"}
              </Text>
            </View>
          )}
        </View>

        {/* Order Notes */}
        <View className="bg-white rounded-md mx-2 mb-1 py-3 px-2 shadow-lg">
          <Text className="text-lg font-bold mb-3 text-gray-900">
            Order Notes (Optional)
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any special instructions..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={200}
            className="border border-gray-200 rounded-lg p-3 text-gray-700 bg-gray-50"
            style={{ textAlignVertical: "top" }}
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {notes.length}/200
          </Text>
        </View>

        {/* Payment Method */}
        <PaymentMethod
          paymentMethod={paymentMethod}
          allowedPaymentMethods={allowedPaymentMethods}
          onPaymentMethodChange={setPaymentMethod}
        />

        {/* Vendor Info */}
        {vendorData && (
          <View className="bg-white rounded-md mx-2 mb-1 py-2 px-3">
            <Text className="text-lg font-bold mb-3 text-gray-900">
              Vendor Information
            </Text>
            <View className="">
              <View className="flex-row mb-2 items-center">
                <Ionicons name="storefront" size={18} color="#F97316" />
                <Text className="ml-2 text-gray-700 flex-1">
                  {vendorData.shopName || vendorData.name}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="call" size={18} color="#F97316" />
                <Text className="ml-2 text-gray-700">
                  {vendorData.contactNo}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Shop Timings */}
        {vendorConfig.shopTiming && (
          <ShopTimings
            isShopOpen={isShopOpen}
            isBreakTime={isBreakTime}
            shopTiming={vendorConfig.shopTiming}
            offHours={vendorConfig.offHours}
            formatDisplayTime={formatDisplayTime}
          />
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Place Order Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder || isStrictMinimumOrderEnforced}
          className={`rounded-xl py-4 items-center ${
            isPlacingOrder || isStrictMinimumOrderEnforced
              ? "bg-gray-300"
              : "bg-orange-500"
          }`}
          activeOpacity={0.8}
        >
          {isPlacingOrder ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">
              {!isAuthenticated
                ? "Sign In to Place Order"
                : `Place Order • ₹${grandTotal.toFixed(2)}`}
            </Text>
          )}
        </TouchableOpacity>
        {isStrictMinimumOrderEnforced && (
          <Text className="text-xs text-red-600 text-center mt-2">
            Minimum order value: ₹{minimumOrderValue.toFixed(2)}
          </Text>
        )}
      </View>

      {/* Address Select Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={setSelectedAddress}
        currentAddress={selectedAddress}
        userAddresses={user?.addressModel || []}
        onAddressValidation={handleAddressValidation}
      />

      {/* Calendar Picker */}
      {isCalendarOpen && (
        <CalendarPicker
          onClose={() => setIsCalendarOpen(false)}
          onSelect={(date: Date) => {
            setSelectedDate(date);
            setSelectedCollectionDate(date);
            setIsCalendarOpen(false);
          }}
          selectedDate={selectedDate}
        />
      )}

      {/* Slot Warning Modal */}
      <SlotSelectionWarningModal
        isOpen={showSlotWarningModal}
        onClose={() => setShowSlotWarningModal(false)}
        message={slotWarningMessage}
      />

      {/* Vendor Change Modal */}
      <VendorChangeModal
        isOpen={showVendorChangeModal}
        onKeepAddress={() => {
          setShowVendorChangeModal(false);
          setPendingAddress(null);
        }}
        onChangeVendor={() => {
          setShowVendorChangeModal(false);
          setIsAddressModalOpen(false);
          router.push("/");
        }}
        vendorName={vendorData?.shopName || vendorData?.name || "This vendor"}
      />

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && (
        <OrderConfirmationModal
          isOpen={showOrderConfirmation}
          onClose={() => {
            clearCart();
            setShowOrderConfirmation(false);
            router.push("/store");
          }}
          orderId={orderConfirmationData.orderId}
          total={orderConfirmationData.total}
          estimatedDelivery={orderConfirmationData.estimatedDelivery}
          vendorName={orderConfirmationData.vendorName}
          vendorContact={orderConfirmationData.vendorContact}
          paymentStatus={orderConfirmationData.paymentStatus}
          onContinueShopping={() => {
            setShowOrderConfirmation(false);
            setOrderConfirmationData(null);
            clearCart();
            router.push("/store");
          }}
          onViewOrder={(orderId) => {
            setShowOrderConfirmation(false);
            setOrderConfirmationData(null);
            clearCart();
            router.push("/store");
          }}
        />
      )}
    </View>
  );
}
