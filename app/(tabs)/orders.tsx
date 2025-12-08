import CustomDropdown from "@/components/CustomDropdown";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import { getStatusBadge, ORDER_STATUS } from "@/lib/constants";
import * as OrderService from "@/services/order";
import { useAuthStore } from "@/stores";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoadingState = () => (
  <View className="flex-1 items-center justify-center py-16">
    <View className="relative mb-6">
      <ActivityIndicator size="large" color="#ea580c" />
    </View>
    <Text className="text-lg font-semibold text-gray-900 mb-2">
      Loading Your Orders
    </Text>
    <Text className="text-gray-500 text-center px-4">
      Please wait while we fetch your order history...
    </Text>
  </View>
);

const EmptyState = ({
  title = "No Orders Yet",
  description = "Browse products and start ordering. Delivery fee is free for your first order!",
}: {
  title?: string;
  description?: string;
}) => (
  <View className="flex-1 items-center justify-center py-16 px-4">
    <View className="w-28 h-28 bg-gray-100 rounded-full items-center justify-center mb-6">
      <MaterialCommunityIcons
        name="package-variant"
        size={56}
        color="#9ca3af"
      />
    </View>
    <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
      {title}
    </Text>
    <Text className="text-gray-500 text-center text-base max-w-sm mb-8 leading-relaxed">
      {description}
    </Text>
    <TouchableOpacity
      className="px-10 py-4 bg-orange-600 rounded-xl"
      activeOpacity={0.7}
      onPress={() => router.push("/")}
    >
      <Text className="text-white font-bold text-base">Start Shopping</Text>
    </TouchableOpacity>
  </View>
);

const GuestSignInPrompt = ({ onSignIn }: { onSignIn: () => void }) => {
  return (
    <View className="flex-1 items-center justify-center py-16 px-4">
      <View className="w-28 h-28 bg-orange-50 rounded-full items-center justify-center mb-6">
        <Ionicons name="log-in-outline" size={56} color="#ea580c" />
      </View>
      <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
        Sign In Required
      </Text>
      <Text className="text-gray-500 text-center text-base max-w-sm mb-8 leading-relaxed">
        Please sign in to view your order history and track your orders.
      </Text>
      <TouchableOpacity
        className="px-10 py-4 bg-orange-600 rounded-xl"
        activeOpacity={0.7}
        onPress={onSignIn}
      >
        <Text className="text-white font-bold text-base">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const StatusDropdown = ({
  selectedStatus,
  onSelectStatus,
}: {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}) => {
  const statusOptions = [
    { value: "all", label: "All Orders" },
    ...Object.entries(ORDER_STATUS).map(([, value]) => ({
      value,
      label: getStatusBadge(value).label,
    })),
  ];

  return (
    <CustomDropdown
      options={statusOptions}
      selectedValue={selectedStatus}
      onValueChange={onSelectStatus}
      placeholder="Select status"
    />
  );
};

const DateFilterDropdown = ({
  selectedDateFilter,
  onSelectDateFilter,
}: {
  selectedDateFilter: string;
  onSelectDateFilter: (filter: string) => void;
}) => {
  const dateFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "year", label: "Last Year" },
  ];

  return (
    <CustomDropdown
      options={dateFilterOptions}
      selectedValue={selectedDateFilter}
      onValueChange={onSelectDateFilter}
      placeholder="Select date range"
    />
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const { user, isGuestMode, setShowAuthModal } = useAuthStore();
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    if (!user?.id || isLoading) return;

    try {
      setIsLoading(true);
      const data = await OrderService.fetchUserOrders(0, user?.id);
      setOrders(data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && !isGuestMode) {
        fetchOrders();
      }
    }, [user?.id, isGuestMode, fetchOrders])
  );

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(
        (order) => new Date(order.orderDate).getTime() >= filterDate.getTime()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toString().includes(searchQuery) ||
          order.vendorShopName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.products?.some((product: any) =>
            product.productName
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered.sort(
      (a: any, b: any) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }, [orders, searchQuery, statusFilter, dateFilter]);

  if (isGuestMode) {
    return (
      <View className="flex-1 bg-gray-50">
        <GuestSignInPrompt onSignIn={() => setShowAuthModal(true)} />
      </View>
    );
  }

  if (isLoading && orders.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <LoadingState />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <RefreshableScrollView
        className="flex-1"
        onRefresh={fetchOrders}
        refreshing={isLoading}
      >
        <View className="px-4 pt-2 pb-6">
          {/* Header */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-3xl font-bold text-gray-900">Orders</Text>
              <TouchableOpacity
                onPress={fetchOrders}
                disabled={isLoading}
                className="p-2 rounded-full bg-gray-100"
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={isLoading ? "#9ca3af" : "#4b5563"}
                />
              </TouchableOpacity>
            </View>

            {/* Search and Filter Row */}
            <View className="flex-row items-center gap-3 mb-2">
              {/* Search Bar */}
              <View className="relative flex-1">
                <Ionicons
                  name="search"
                  size={20}
                  color="#9ca3af"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: 12,
                    zIndex: 1,
                  }}
                />
                <TextInput
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full bg-white text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            {/* Filter Dropdowns */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <StatusDropdown
                  selectedStatus={statusFilter}
                  onSelectStatus={setStatusFilter}
                />
              </View>
              <View className="flex-1">
                <DateFilterDropdown
                  selectedDateFilter={dateFilter}
                  onSelectDateFilter={setDateFilter}
                />
              </View>
            </View>
          </View>

          {/* Orders List */}
          {filteredAndSortedOrders.length === 0 ? (
            <EmptyState
              title={
                searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "No Orders Found"
                  : "No Orders Yet"
              }
              description={
                searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Browse products and start ordering. Delivery fee is free for your first order!"
              }
            />
          ) : (
            <View className="space-y-3">
              {filteredAndSortedOrders.map((order) => (
                <OrderCard key={order.orderId} order={order} router={router} />
              ))}
            </View>
          )}
        </View>
      </RefreshableScrollView>
    </View>
  );
}

const OrderCard = ({ order, router }: { order: any; router: any }) => {
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const orderDate = formatDateTime(order.orderDate);
  const orderTime = formatTime(order.orderDate);
  const statusBadge = getStatusBadge(order.status);

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, { name: any; color: string }> = {
      Pending: { name: "alert-circle-outline", color: "#ca8a04" },
      Accepted: { name: "checkmark-circle-outline", color: "#2563eb" },
      Rescheduled: { name: "calendar-outline", color: "#9333ea" },
      OutForDelivery: { name: "bicycle-outline", color: "#4f46e5" },
      Delivered: { name: "checkmark-done-circle-outline", color: "#16a34a" },
      Cancelled: { name: "close-circle-outline", color: "#dc2626" },
      Paid: { name: "card-outline", color: "#059669" },
    };
    return iconMap[status] || { name: "help-circle-outline", color: "#6b7280" };
  };

  const statusIcon = getStatusIcon(order.status);

  const handleNavigation = () => {
    router.push(
      `/orders/${order.id}?orderDate=${encodeURIComponent(order.orderDate)}`
    );
  };

  return (
    <TouchableOpacity
      onPress={handleNavigation}
      className="bg-white rounded-xl border border-gray-200 p-4 mb-3"
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="package-variant"
            size={20}
            color="#4b5563"
          />
          <Text className="text-base font-semibold text-gray-900">
            Order #{order.orderId}
          </Text>
        </View>
        <View
          className={`px-3 py-1.5 rounded-full ${statusBadge.bg} flex-row items-center gap-1.5`}
        >
          <Ionicons name={statusIcon.name} size={14} color={statusIcon.color} />
          <Text className={`text-xs font-semibold ${statusBadge.text}`}>
            {statusBadge.label}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View className="space-y-2">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <FontAwesome5 name="rupee-sign" size={14} color="#6b7280" />
            <Text className="text-sm font-medium text-gray-900">
              {order.total}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600">{orderDate}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600">{orderTime}</Text>
          </View>
        </View>

        {order.products && order.products.length > 0 && (
          <View className="flex-row items-center gap-1 mt-1">
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={14}
              color="#6b7280"
            />
            <Text className="text-sm text-gray-600">
              {order.products.length} item{order.products.length > 1 ? "s" : ""}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
