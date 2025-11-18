import { useLocationStore, useStoreStore } from "@/stores";
import { DistanceResult } from "@/utils/distanceUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AttributeValueProps {
  name: string;
  value: string;
}

interface Vendor {
  id: string;
  name: string;
  shopName: string;
  contactNo: string;
  profileImage: string;
  vendorImages: string[];
  vendorCategories: any[];
  attributeValues: AttributeValueProps[];
  deliveryRadius: number;
  address?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
}

interface VendorCardProps {
  vendor: Vendor;
  distance?: DistanceResult;
  onPress?: () => void;
}

export default function VendorCard({ vendor, distance }: VendorCardProps) {
  const router = useRouter();
  const { setSelectedVendor, setDeliveryLocation } = useStoreStore();
  const { location }: any = useLocationStore();

  // Check if vendor is showcase-only (profile view only, no shopping)
  const isShowcaseOnly =
    vendor?.attributeValues?.find(
      (attr: AttributeValueProps) => attr?.name === "isShowcaseOnly"
    )?.value === "true";

  const handlePress = () => {
    setSelectedVendor(vendor);
    setDeliveryLocation(location);
    if (isShowcaseOnly) {
      router.push("/vendor/profile");
    } else {
      router.push("/store");
    }
  };

  const getVendorImage = () => {
    if (vendor.profileImage) return vendor.profileImage;
    if (vendor.vendorImages && vendor.vendorImages.length > 0)
      return vendor.vendorImages[0];
    return null;
  };

  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatShortDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  const calculateDeliveryInfo = (): string | null => {
    if (!vendor || !vendor.attributeValues) return null;

    const config: Record<string, any> = {};
    vendor.attributeValues.forEach((attr: AttributeValueProps) => {
      try {
        config[attr.name] = JSON.parse(attr.value);
      } catch (e) {
        config[attr.name] = attr.value;
      }
    });

    const min = Number.parseInt(config?.minDays, 10);
    const max = Number.parseInt(config?.maxDays, 10);
    const method = config.deliveryMethod?.product || "by hour";
    const preparationTime = config?.deliveryPreparationTime;

    if (!Number.isNaN(min) && !Number.isNaN(max) && max > 0) {
      if (min === max) return `Delivers in ${max} ${max > 1 ? "days" : "day"}`;
      return `Delivers in ${min}-${max} days`;
    }

    if (method === "by hour" && preparationTime?.product) {
      const now = new Date();
      const [openingHour, openingMinute] = (config.shopTiming?.start || "08:00")
        .split(":")
        .map(Number);
      const [closingHour, closingMinute] = (config.shopTiming?.end || "21:00")
        .split(":")
        .map(Number);

      const openingTime = new Date(now);
      openingTime.setHours(openingHour, openingMinute, 0, 0);

      const closingTime = new Date(now);
      closingTime.setHours(closingHour, closingMinute, 0, 0);

      if (closingHour < openingHour && now.getHours() >= openingHour) {
        closingTime.setDate(closingTime.getDate() + 1);
      } else if (closingHour < openingHour && now.getHours() < closingHour) {
        openingTime.setDate(openingTime.getDate() - 1);
      }

      const prepHours = Number.parseFloat(preparationTime.product);
      const estimatedDeliveryTime = new Date(
        now.getTime() + prepHours * 60 * 60 * 1000
      );

      if (now < openingTime || now >= closingTime) {
        const nextOpeningTime = new Date(openingTime);
        if (now >= closingTime) {
          nextOpeningTime.setDate(nextOpeningTime.getDate() + 1);
        }
        const deliveryDate = new Date(
          nextOpeningTime.getTime() + prepHours * 60 * 60 * 1000
        );
        return `Deliver By ${formatTime(deliveryDate)}, ${formatShortDate(
          deliveryDate
        )}`;
      }

      if (estimatedDeliveryTime >= closingTime) {
        const nextOpeningTime = new Date(openingTime);
        nextOpeningTime.setDate(nextOpeningTime.getDate() + 1);
        const deliveryDate = new Date(
          nextOpeningTime.getTime() + prepHours * 60 * 60 * 1000
        );
        return `Deliver By ${formatTime(deliveryDate)}, Tomorrow`;
      }

      return `Deliver By ${formatTime(estimatedDeliveryTime)}, Today`;
    }

    return null;
  };

  const image = getVendorImage();
  const deliveryInfo = calculateDeliveryInfo();
  const locationCity = vendor.address?.city || "New Delhi";

  return (
    <TouchableOpacity
      className="bg-white rounded-md mb-2 max-h-40 overflow-hidden shadow-lg shadow-white border border-gray-100"
      activeOpacity={1}
      onPress={handlePress}
    >
      <View className="flex-row ">
        {/* Image Section - Left */}
        <View className="relative mr-4 w-28 h-full overflow-hidden">
          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full rounded-l-md"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full rounded-l-md bg-gray-100 items-center justify-center">
              <Ionicons name="storefront" size={40} color="#9CA3AF" />
            </View>
          )}
          {/* Favorite Icon */}
          <TouchableOpacity className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5">
            <Ionicons name="heart-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Content Section - Right */}
        <View className="flex-1 py-1.5 pr-2 justify-between">
          {/* Top Section */}
          <View>
            {/* Shop Name */}
            <Text
              className="text-lg font-bold text-gray-900 mb-1"
              numberOfLines={1}
            >
              {vendor.shopName}
            </Text>

            {/* Subtitle/Description */}
            <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
              {vendor.vendorCategories
                ?.slice(0, 3)
                .map((cat: any) => cat.name)
                .join(" • ")}
            </Text>

            {/* Location & Distance */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={14} color="#EF4444" />
              <Text className="text-xs text-gray-600 ml-1">{locationCity}</Text>
              {distance && (
                <>
                  <View className="w-1 h-1 rounded-full bg-gray-400 mx-2" />
                  <Text className="text-xs font-semibold text-gray-700">
                    {distance.distance}
                  </Text>
                </>
              )}
            </View>

            {/* Delivery Info */}
            {deliveryInfo && (
              <View className="flex-row items-center">
                <Ionicons name="bicycle" size={14} color="#10B981" />
                <Text className="text-xs text-gray-600 ml-1">
                  <Text className="font-semibold text-gray-900">
                    {deliveryInfo}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Section - Shop Now / View Profile Button */}
          <TouchableOpacity
            className="bg-orange-500 rounded-lg py-2.5 mt-2 items-center justify-center"
            activeOpacity={0.8}
            onPress={handlePress}
          >
            <Text className="text-white text-sm font-bold">
              {isShowcaseOnly ? "View Profile" : "Shop Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
