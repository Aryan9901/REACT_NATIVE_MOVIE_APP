import AdvancedSearch from "@/components/AdvancedSearch";
import HomeHeader from "@/components/HomeHeader";
import VendorList from "@/components/VendorList";
import {
  getCategoryIcon,
  getFallbackIconName,
} from "@/constants/categoryIcons";
import { fetchNearbyVendors } from "@/services/vendor.service";
import { useAuthStore, useLocationStore } from "@/stores";
import {
  calculateDistancesForVendors,
  DistanceResult,
} from "@/utils/distanceUtils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";

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

export default function Index() {
  // Zustand stores
  const user = useAuthStore((state) => state.user);
  const location = useLocationStore((state) => state.location);
  const isLocationTurnedOff = useLocationStore(
    (state) => state.isLocationTurnedOff
  );
  const loadingLocation = useLocationStore((state) => state.loadingLocation);
  const getLiveLocation = useLocationStore((state) => state.getLiveLocation);

  const toast = useToast();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [distanceMap, setDistanceMap] = useState<Map<string, DistanceResult>>(
    new Map()
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const handleFilteredResults = (filtered: Vendor[]) => {
    setFilteredVendors(filtered);
  };

  const handleCategoryPress = (category: string, index: number) => {
    setSelectedCategory(category === "All" ? null : category);

    // Calculate position to center the selected category
    const ITEM_WIDTH = 64; // size-16 = 64px
    const GAP = 12;
    const PADDING = 16;
    const screenWidth = Dimensions.get("window").width;
    const totalItemWidth = ITEM_WIDTH + GAP;

    // Calculate scroll position to center the item
    const itemPosition = index * totalItemWidth + PADDING;
    const centerOffset = screenWidth / 2 - ITEM_WIDTH / 2;
    const scrollX = itemPosition - centerOffset;

    scrollViewRef.current?.scrollTo({
      x: scrollX,
      animated: true,
    });
  };

  useEffect(() => {
    const fetchVendors = async () => {
      if (!location || !location?.latitude || !location?.longitude) {
        try {
          await getLiveLocation(false, null, true, user?.id, toast);
        } catch (error) {
          console.error("Failed to get location:", error);
          setLoading(false);
        }
      } else {
        setLoading(true);
        try {
          const response = await fetchNearbyVendors(
            location?.latitude,
            location?.longitude,
            user
          );

          if (response && Array.isArray(response)) {
            const allCategories = new Set<string>();
            response.forEach((vendor: Vendor) => {
              vendor.vendorCategories?.forEach((cat: any) => {
                // Trim category names to remove trailing/leading spaces
                const categoryName = cat.name?.trim();
                if (categoryName) {
                  allCategories.add(categoryName);
                }
              });
            });
            setCategories(["All", ...Array.from(allCategories)]);

            // Calculate distances for all vendors
            if (location?.latitude && location?.longitude) {
              calculateDistancesForVendors(
                location.latitude,
                location.longitude,
                response
              ).then((distances) => {
                setDistanceMap(distances);

                // Add distance to vendor objects
                const vendorsWithDistance = response.map((vendor: Vendor) => {
                  const distanceInfo = distances.get(vendor.id);
                  return {
                    ...vendor,
                    distance: distanceInfo
                      ? distanceInfo.distanceValue / 1000
                      : 0,
                  };
                });

                setVendors(vendorsWithDistance);
                setFilteredVendors(vendorsWithDistance);
              });
            } else {
              setVendors(response);
              setFilteredVendors(response);
            }
          }
        } catch (error) {
          console.error("Failed to fetch vendors:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVendors();
  }, [location, user]);

  return (
    <View className="flex-1 bg-gray-50">
      <HomeHeader />

      {/* Advanced Search with Filters */}
      <AdvancedSearch
        vendors={vendors}
        onFilteredResults={handleFilteredResults}
        selectedCategory={selectedCategory}
      />

      {/* Category Filter */}
      {categories.length > 0 && (
        <View className="bg-white border-b border-gray-100">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={76}
            decelerationRate="fast"
            className="py-2"
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}
          >
            {categories.map((category, index) => {
              const isSelected =
                (category === "All" && !selectedCategory) ||
                selectedCategory === category;

              // Get category icon from constants
              const categoryIcon = getCategoryIcon(category);

              const fallbackIcon = getFallbackIconName(category);

              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryPress(category, index)}
                  className="items-center"
                >
                  <View
                    className={`size-16 rounded-2xl items-center justify-center mb-2 ${
                      isSelected ? "bg-orange-300" : "bg-gray-100"
                    }`}
                  >
                    {categoryIcon ? (
                      <Image
                        source={categoryIcon}
                        className="size-14"
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name={fallbackIcon as any}
                        size={28}
                        color={isSelected ? "#F97316" : "#6B7280"}
                      />
                    )}
                  </View>
                  <Text
                    className={`text-xs font-medium text-center ${
                      isSelected ? "text-orange-600" : "text-gray-700"
                    }`}
                    numberOfLines={2}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Vendor List */}
      <VendorList
        vendors={filteredVendors}
        distanceMap={distanceMap}
        loading={loading}
        loadingLocation={loadingLocation}
        isLocationTurnedOff={isLocationTurnedOff}
        selectedCategory={selectedCategory}
        onEnableLocation={() =>
          getLiveLocation(false, null, true, user?.id, toast)
        }
      />
    </View>
  );
}
