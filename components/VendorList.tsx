import { DistanceResult } from "@/utils/distanceUtils";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VendorCard from "./VendorCard";

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

interface VendorListProps {
  vendors: Vendor[];
  distanceMap: Map<string, DistanceResult>;
  loading: boolean;
  loadingLocation: boolean;
  isLocationTurnedOff: boolean;
  selectedCategory: string | null;
  onEnableLocation: () => void;
  onVendorPress?: (vendor: Vendor) => void;
}

export default function VendorList({
  vendors,
  distanceMap,
  loading,
  loadingLocation,
  isLocationTurnedOff,
  selectedCategory,
  onEnableLocation,
  onVendorPress,
}: VendorListProps) {
  if (isLocationTurnedOff) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="location-outline" size={80} color="#EF4444" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">
          Location Required
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          Please enable location services to find vendors near you
        </Text>
        <TouchableOpacity
          onPress={onEnableLocation}
          className="bg-green-500 px-6 py-3 rounded-lg"
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Enable Location</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || loadingLocation) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10B981" />
        <Text className="text-gray-600 mt-4">
          {loadingLocation ? "Getting your location..." : "Loading vendors..."}
        </Text>
      </View>
    );
  }

  if (vendors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="storefront-outline" size={80} color="#D1D5DB" />
        <Text className="text-xl font-semibold text-gray-700 mt-4">
          No vendors found
        </Text>
        <Text className="text-gray-500 text-center mt-2">
          {selectedCategory
            ? "Try adjusting your filters"
            : "No vendors available in your area"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={vendors}
      renderItem={({ item }) => (
        <VendorCard
          vendor={item}
          distance={distanceMap.get(item.id)}
          onPress={() => onVendorPress?.(item)}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 8 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
