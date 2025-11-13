import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  distance?: number;
  rating?: number;
  address?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    addressLineOne?: string;
    addressLineTwo?: string;
  };
}

interface AdvancedSearchProps {
  vendors: Vendor[];
  onFilteredResults: (vendors: Vendor[]) => void;
  selectedCategory: string | null;
}

// Helper: Recursively extracts all category names from nested structure
const getAllCategoryNames = (categories: any): string[] => {
  const names = new Set<string>();
  const traverse = (categoryList: any) => {
    if (!categoryList || categoryList.length === 0) return;
    categoryList.forEach((cat: any) => {
      if (cat.name) names.add(cat.name);
      traverse(cat.subCategories);
    });
  };
  traverse(categories);
  return Array.from(names);
};

export default function AdvancedSearch({
  vendors,
  onFilteredResults,
  selectedCategory,
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>({
    distance: "",
    deliveryCharges: "",
    minimumOrder: "",
    freeDelivery: false,
    openNow: false,
    categories: [],
    sortBy: "",
  });

  // Helper functions
  const parseVendorAttributes = (attributes: AttributeValueProps[] = []) => {
    return attributes.reduce((acc: any, attr: AttributeValueProps) => {
      if (attr.name && attr.value) {
        try {
          acc[attr.name] = JSON.parse(attr.value);
        } catch (e) {
          acc[attr.name] = attr.value;
        }
      }
      return acc;
    }, {});
  };

  // Extract available categories
  const availableCategories = useMemo(() => {
    const categorySet = new Set<string>();
    vendors.forEach((vendor: Vendor) => {
      const names = getAllCategoryNames(vendor.vendorCategories);
      names.forEach((name) => categorySet.add(name));
    });
    return Array.from(categorySet).sort();
  }, [vendors]);

  const isStoreOpen = (attributes: any) => {
    const now = new Date();
    const dayOfWeek = now.toLocaleString("en-US", { weekday: "long" });
    if (attributes.weeklyOffDay === dayOfWeek) return false;

    const { shopTiming } = attributes;
    if (!shopTiming?.start || !shopTiming?.end) return true;

    const [startHour, startMinute] = shopTiming.start.split(":").map(Number);
    const [endHour, endMinute] = shopTiming.end.split(":").map(Number);

    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    return now >= startTime && now <= endTime;
  };

  const hasActiveFilters =
    searchQuery ||
    filters.freeDelivery ||
    filters.openNow ||
    filters.categories.length > 0;

  const performSearch = useMemo(() => {
    if (!vendors || vendors.length === 0) return [];

    const filteredVendors = vendors.filter((vendor: Vendor) => {
      const vendorCategoryNames = getAllCategoryNames(vendor.vendorCategories);

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const searchableText = [
          vendor.shopName,
          vendor.name,
          vendor.address?.addressLineOne,
          vendor.address?.addressLineTwo,
          vendor.contactNo,
          ...vendorCategoryNames,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      if (selectedCategory && selectedCategory !== "All") {
        if (!vendorCategoryNames.includes(selectedCategory)) {
          return false;
        }
      }

      if (filters.categories.length > 0) {
        const vendorCategorySet = new Set(vendorCategoryNames);
        const hasMatchingCategory = filters.categories.some(
          (category: string) => vendorCategorySet.has(category)
        );
        if (!hasMatchingCategory) return false;
      }

      if (filters.distance && vendor.distance) {
        const maxDistance = parseFloat(filters.distance);
        if (vendor.distance > maxDistance) return false;
      }

      if (filters.deliveryCharges) {
        const attributes = parseVendorAttributes(vendor.attributeValues);
        const deliveryCharges = parseFloat(attributes.deliveryCharges || 0);
        const maxCharges = parseFloat(filters.deliveryCharges);
        if (deliveryCharges > maxCharges) return false;
      }

      if (filters.minimumOrder) {
        const attributes = parseVendorAttributes(vendor.attributeValues);
        const minimumOrder = parseFloat(attributes.minimumOrder || 0);
        const maxMinOrder = parseFloat(filters.minimumOrder);
        if (minimumOrder > maxMinOrder) return false;
      }

      if (filters.freeDelivery) {
        const attributes = parseVendorAttributes(vendor.attributeValues);
        const hasFreeDelivery =
          attributes.freeDeliveryOnMinimumOrder ||
          (attributes.minimumOrder && attributes.deliveryCharges);
        if (!hasFreeDelivery) return false;
      }

      if (filters.openNow) {
        const attributes = parseVendorAttributes(vendor.attributeValues);
        const isOpen = isStoreOpen(attributes);
        if (!isOpen) return false;
      }

      return true;
    });

    filteredVendors.sort((a: Vendor, b: Vendor) => {
      switch (filters.sortBy) {
        case "name":
          return (a.shopName || a.name).localeCompare(b.shopName || b.name);
        case "distance":
          return (a.distance || 999) - (b.distance || 999);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filteredVendors;
  }, [vendors, searchQuery, filters, selectedCategory]);

  useEffect(() => {
    onFilteredResults(performSearch);
  }, [performSearch, onFilteredResults]);

  const noResultsWithFilters = performSearch.length === 0 && hasActiveFilters;

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      distance: "",
      deliveryCharges: "",
      minimumOrder: "",
      freeDelivery: false,
      openNow: false,
      categories: [],
      sortBy: "distance",
    });
  };

  const toggleCategory = (category: string) => {
    setFilters((prev: any) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  return (
    <View>
      {/* Search Bar */}
      <View className="px-4 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4  border border-gray-200">
          <Ionicons name="search" size={22} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search stores, products, or locations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="ml-2 relative"
          >
            <Ionicons
              name="options"
              size={22}
              color={showFilters || hasActiveFilters ? "#F97316" : "#9CA3AF"}
            />
            {hasActiveFilters && (
              <View className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* No Results Message */}
      {noResultsWithFilters && (
        <View className="bg-orange-50 border border-orange-200 rounded-xl p-6 mx-4 my-4">
          <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mx-auto mb-3">
            <Ionicons name="search" size={24} color="#EA580C" />
          </View>
          <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
            No Results Found
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            No vendors match your current search criteria.
          </Text>
          <View className="flex-row gap-2 justify-center">
            <TouchableOpacity
              onPress={clearFilters}
              className="flex-1 px-4 py-2 bg-orange-600 rounded-lg"
            >
              <Text className="text-white font-medium text-center">
                Clear Filters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              className="flex-1 px-4 py-2 bg-white border border-orange-200 rounded-lg"
            >
              <Text className="text-orange-600 font-medium text-center">
                Adjust Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Filter Drawer Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowFilters(false)}
          />
          <View className="bg-white rounded-t-3xl h-[80%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">
                Filters
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                className="w-8 h-8 items-center justify-center rounded-lg bg-gray-100"
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-4">
              {/* Quick Filters */}
              <View className="mb-6">
                <Text className="font-medium text-gray-900 mb-3">
                  Quick Filters
                </Text>
                <View className="space-y-3">
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-gray-700">Free Delivery</Text>
                    <Switch
                      value={filters.freeDelivery}
                      onValueChange={(value) =>
                        setFilters((prev: any) => ({
                          ...prev,
                          freeDelivery: value,
                        }))
                      }
                      trackColor={{ false: "#D1D5DB", true: "#FED7AA" }}
                      thumbColor={filters.freeDelivery ? "#EA580C" : "#F3F4F6"}
                    />
                  </View>
                  <View className="flex-row items-center justify-between py-2">
                    <Text className="text-sm text-gray-700">Open Now</Text>
                    <Switch
                      value={filters.openNow}
                      onValueChange={(value) =>
                        setFilters((prev: any) => ({ ...prev, openNow: value }))
                      }
                      trackColor={{ false: "#D1D5DB", true: "#FED7AA" }}
                      thumbColor={filters.openNow ? "#EA580C" : "#F3F4F6"}
                    />
                  </View>
                </View>
              </View>

              {/* Categories */}
              {availableCategories.length > 0 && (
                <View className="mb-6">
                  <Text className="font-medium text-gray-900 mb-3">
                    Categories
                  </Text>
                  <View className="space-y-2">
                    {availableCategories.map((category: string) => (
                      <TouchableOpacity
                        key={category}
                        onPress={() => toggleCategory(category)}
                        className="flex-row items-center justify-between py-2"
                      >
                        <Text className="text-sm text-gray-700 flex-1">
                          {category}
                        </Text>
                        <View
                          className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            filters.categories.includes(category)
                              ? "bg-orange-600 border-orange-600"
                              : "border-gray-300"
                          }`}
                        >
                          {filters.categories.includes(category) && (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View className="px-4 py-3 border-t border-gray-100 bg-white">
              <View className="flex-row gap-3">
                {hasActiveFilters && (
                  <TouchableOpacity
                    onPress={clearFilters}
                    className="flex-1 py-3 border border-orange-200 rounded-lg"
                  >
                    <Text className="text-orange-600 font-medium text-center">
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowFilters(false)}
                  className="flex-1 py-3 bg-orange-600 rounded-lg"
                >
                  <Text className="text-white font-medium text-center">
                    Apply Filters
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
