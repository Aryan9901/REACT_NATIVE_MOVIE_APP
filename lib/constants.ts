export const API_URL = {
  BASE_AUTH: process.env.EXPO_PUBLIC_BASE_AUTH,
  BASE_USER: process.env.EXPO_PUBLIC_BASE_USER,
  BASE_VENDOR: process.env.EXPO_PUBLIC_BASE_VENDOR,
  BASE_PRODUCT: process.env.EXPO_PUBLIC_BASE_PRODUCT,
  BASE_ORDER: process.env.EXPO_PUBLIC_BASE_ORDER,
};

export const USER_ROLES = {
  USER: "User",
  VENDOR: "Vendor",
  ADMIN: "Admin",
};

export const STORAGE_KEYS = {
  USER: "@user",
  TOKEN: "@token",
  MOBILE: "@mobile",
  SESSION_TOKEN: "@sessionToken",
  REFRESH_TOKEN: "@refreshToken",
  GUEST_MODE: "#guestMode",
  SELECTED_VENDOR: "@selected_vendor",
  SELECTED_LOCATION: "@selectedLocation",
  SAVED_CART: "@savedCart",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  RESCHEDULED: "Rescheduled",
  OUT_FOR_DELIVERY: "OutForDelivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PAID: "Paid",
};

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; bg: string; text: string }> =
    {
      Pending: {
        label: "Pending",
        bg: "bg-yellow-100",
        text: "text-yellow-800",
      },
      Accepted: {
        label: "Accepted",
        bg: "bg-blue-100",
        text: "text-blue-800",
      },
      Rescheduled: {
        label: "Rescheduled",
        bg: "bg-purple-100",
        text: "text-purple-800",
      },
      OutForDelivery: {
        label: "Out for Delivery",
        bg: "bg-indigo-100",
        text: "text-indigo-800",
      },
      Delivered: {
        label: "Delivered",
        bg: "bg-green-100",
        text: "text-green-800",
      },
      Cancelled: {
        label: "Cancelled",
        bg: "bg-red-100",
        text: "text-red-800",
      },
      Paid: {
        label: "Paid",
        bg: "bg-emerald-100",
        text: "text-emerald-800",
      },
    };

  return (
    statusMap[status] || {
      label: status,
      bg: "bg-gray-100",
      text: "text-gray-800",
    }
  );
};
