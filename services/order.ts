import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export interface Order {
  id: string;
  orderId: string;
  userId: string;
  vendorId: string;
  vendorShopName: string;
  status: string;
  total: number;
  orderDate: string;
  deliveryDate?: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  attributeModels?: Array<{
    name: string;
    value: string;
  }>;
}

export const fetchUserOrders = async (
  pageNo: number = 0,
  userId: string
): Promise<Order[]> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  if (!sessionToken || !userId) {
    throw new Error("No session token or user ID found");
  }

  const url = `${API_URL.BASE_ORDER}/rest/big-local/api/v1/orders/user?pageNo=${pageNo}`;
  const headers = {
    sessionToken,
    "X-User-Id": userId,
    "X-USER-ROLE": USER_ROLES.USER,
  };

  const { data } = await axios.get(url, { headers });
  return data as Order[];
};

export const fetchOrderDetails = async (orderId: string): Promise<Order> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

  if (!sessionToken) {
    throw new Error("No session token found");
  }

  const url = `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order/details`;
  const headers = {
    sessionToken,
    "X-USER-ROLE": USER_ROLES.USER,
  };

  const { data } = await axios.get(url, {
    params: { orderId },
    headers,
  });
  return data as Order;
};

export const cancelOrder = async (
  orderId: string,
  cancellationReason: string,
  attributeModels?: Array<{ name: string; value: string }>
): Promise<boolean> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

  if (!sessionToken) {
    throw new Error("No session token found");
  }

  try {
    // Update the attributes to set "Cancelled On" with current date
    const apiAttributes =
      attributeModels?.map((attr: any) => {
        if (attr.name === "Cancelled On") {
          return { ...attr, value: new Date().toISOString() };
        }
        return attr;
      }) || [];

    const url = `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order/status`;
    const headers = {
      sessionToken,
      "X-USER-ROLE": USER_ROLES.USER,
    };

    await axios.put(
      url,
      {
        orderId,
        status: "Cancelled",
        cancellationReason,
        attributeModels: apiAttributes,
      },
      { headers }
    );
    return true;
  } catch (error) {
    console.error("Error cancelling order:", error);
    return false;
  }
};

export const rescheduleOrder = async (
  orderId: string,
  newDeliveryDate: Date,
  attributeModels?: Array<{ name: string; value: string }>,
  selectedSlot?: string,
  isService?: boolean
): Promise<boolean> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

  if (!sessionToken) {
    throw new Error("No session token found");
  }

  try {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Update the attributes
    const apiAttributes =
      attributeModels?.map((attr: any) => {
        // For service orders, update SERVICE_PICKUP_TIME
        if (isService) {
          if (attr.name === "Service Pickup Time" && selectedSlot) {
            const [start, end] = selectedSlot.split("-");
            const [startHour, startMinute] = start.split(":").map(Number);
            const [endHour, endMinute] = end.split(":").map(Number);

            const startTime = new Date(newDeliveryDate);
            startTime.setHours(startHour, startMinute, 0, 0);

            const endTime = new Date(newDeliveryDate);
            endTime.setHours(endHour, endMinute, 0, 0);

            const pickupDateTime = `${formatTime(startTime)} - ${formatTime(
              endTime
            )} on ${newDeliveryDate.toDateString()}`;
            return { ...attr, value: pickupDateTime };
          } else if (attr.name === "Rescheduled On") {
            return { ...attr, value: new Date().toISOString() };
          }
          return attr;
        }

        // For regular orders, update DELIVERY_TIME
        if (attr.name === "Delivery Time") {
          if (selectedSlot) {
            const [start, end] = selectedSlot.split("-");
            const [startHour, startMinute] = start.split(":").map(Number);
            const [endHour, endMinute] = end.split(":").map(Number);

            const startTime = new Date(newDeliveryDate);
            startTime.setHours(startHour, startMinute, 0, 0);

            const endTime = new Date(newDeliveryDate);
            endTime.setHours(endHour, endMinute, 0, 0);

            const deliveryDateTime = `${formatTime(startTime)} - ${formatTime(
              endTime
            )} on ${newDeliveryDate.toDateString()}`;
            return { ...attr, value: deliveryDateTime };
          } else {
            // Fallback to default time
            const deliveryTime = new Date(newDeliveryDate);
            deliveryTime.setHours(20, 0, 0, 0);
            const deliveryDateTime = `by ${formatTime(
              deliveryTime
            )} on ${deliveryTime.toDateString()}`;
            return { ...attr, value: deliveryDateTime };
          }
        } else if (attr.name === "Rescheduled On") {
          return { ...attr, value: new Date().toISOString() };
        }
        return attr;
      }) || [];

    const url = `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order/status`;
    const headers = {
      sessionToken,
      "X-USER-ROLE": USER_ROLES.USER,
    };

    await axios.put(
      url,
      {
        orderId,
        status: "Rescheduled",
        attributeModels: apiAttributes,
      },
      { headers }
    );
    return true;
  } catch (error) {
    console.error("Error rescheduling order:", error);
    return false;
  }
};
