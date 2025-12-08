// Order payload construction utilities
import { ORDER_ATTRIBUTE_KEYS, PAYMENT_MODE } from "@/lib/constants";
import { formatAddress } from "@/utils/locationUtils";
import { formatFullDate } from "./dateUtils";

interface BuildOrderPayloadParams {
  totalMrp: number;
  totalSavings: number;
  grandTotal: number;
  vendorData: any;
  deliveryAddress: any;
  notes: string;
  cart: any[];
  deliveryMethod: string;
  deliveryCharge: number;
  deliveryTime: string;
  hasServiceCollection: boolean;
  collectionTime: string;
  paymentMethod: string;
  tableNo?: number;
  isMembership: boolean;
  isDineIn?: boolean;
  vendorConfig?: any;
}

export const buildOrderPayload = (params: BuildOrderPayloadParams) => {
  const {
    totalMrp,
    totalSavings,
    grandTotal,
    vendorData,
    deliveryAddress,
    notes,
    cart,
    deliveryMethod,
    deliveryCharge,
    deliveryTime,
    hasServiceCollection,
    collectionTime,
    paymentMethod,
    tableNo,
    isMembership,
    isDineIn = false,
    vendorConfig,
  } = params;

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

  return {
    mrp: totalMrp,
    discount: totalSavings,
    total: grandTotal,
    contactNo: vendorData?.contactNo || "",
    deliveryAddress: deliveryAddress
      ? String(formatAddress(deliveryAddress) || "")
      : String(vendorData?.address || ""),
    note: notes || "",
    items: cartItems,
    selfPickup: deliveryMethod === "Self Pickup",
    attributeModels: [
      {
        name: ORDER_ATTRIBUTE_KEYS.DELIVERY_CHARGE,
        value: isMembership ? "0" : deliveryCharge.toString(),
      },
      {
        name: ORDER_ATTRIBUTE_KEYS.CANCELLED_BY,
        value: "",
      },
      { name: ORDER_ATTRIBUTE_KEYS.DELIVERY_METHOD, value: deliveryMethod },
      { name: ORDER_ATTRIBUTE_KEYS.DELIVERY_TIME, value: deliveryTime },
      {
        name: ORDER_ATTRIBUTE_KEYS.ORDER_DATE,
        value: new Date().toISOString(),
      },
      { name: ORDER_ATTRIBUTE_KEYS.PAYMENT_METHOD, value: paymentMethod },
      { name: ORDER_ATTRIBUTE_KEYS.DELIVERED_ON, value: "" },
      {
        name: ORDER_ATTRIBUTE_KEYS.IS_SERVICE,
        value: hasServiceCollection ? "true" : "false",
      },
      { name: ORDER_ATTRIBUTE_KEYS.SUBSCRIBED_ON, value: "" },
      { name: ORDER_ATTRIBUTE_KEYS.RESCHEDULED_ON, value: "" },
      { name: ORDER_ATTRIBUTE_KEYS.APPROVED_ON, value: "" },
      { name: ORDER_ATTRIBUTE_KEYS.OUT_FOR_DELIVERY_ON, value: "" },
      {
        name: ORDER_ATTRIBUTE_KEYS.PAID_ON,
        value:
          paymentMethod === PAYMENT_MODE.PREPAID
            ? new Date().toISOString()
            : "",
      },
      { name: ORDER_ATTRIBUTE_KEYS.CANCELLED_ON, value: "" },
      ...(collectionTime
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.SERVICE_PICKUP_TIME,
              value: collectionTime,
            },
          ]
        : []),
      ...(deliveryMethod === "Self Pickup" && tableNo
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.TABLE_NUMBER,
              value: tableNo.toString(),
            },
          ]
        : []),
      ...(isDineIn
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.IS_DINE_IN,
              value: "true",
            },
          ]
        : []),
      // Store vendor configuration for future rescheduling
      ...(vendorConfig?.deliverySlots
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.DELIVERY_SLOTS,
              value: JSON.stringify(vendorConfig.deliverySlots),
            },
          ]
        : []),
      ...(vendorConfig?.shopTiming
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.SHOP_TIMING,
              value: JSON.stringify(vendorConfig.shopTiming),
            },
          ]
        : []),
      ...(vendorConfig?.weeklyOffDay
        ? [
            {
              name: ORDER_ATTRIBUTE_KEYS.WEEKLY_OFF_DAY,
              value: vendorConfig.weeklyOffDay,
            },
          ]
        : []),
    ],
  };
};

export const buildDeliveryTimeString = (
  deliveryInfo: any,
  selectedSlot: string | null,
  selectedDate: Date
): string => {
  if (deliveryInfo.type === "days" || deliveryInfo.type === "hour") {
    return deliveryInfo.standard.displayMessage;
  }
  if (selectedSlot) {
    return `Between ${selectedSlot} on ${formatFullDate(selectedDate)}`;
  }
  return "";
};

export const buildCollectionTimeString = (
  selectedCollectionSlot: string,
  selectedCollectionDate: Date
): string => {
  return `${selectedCollectionSlot} on ${formatFullDate(
    selectedCollectionDate
  )}`;
};
