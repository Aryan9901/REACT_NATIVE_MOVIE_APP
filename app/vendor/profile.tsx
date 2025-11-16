import VendorBusinessHours from "@/components/vendor/VendorBusinessHours";
import VendorBusinessInfo from "@/components/vendor/VendorBusinessInfo";
import VendorCategories from "@/components/vendor/VendorCategories";
import VendorGallery from "@/components/vendor/VendorGallery";
import VendorLocation from "@/components/vendor/VendorLocation";
import VendorOverview from "@/components/vendor/VendorOverview";
import VendorProfileHeader from "@/components/vendor/VendorProfileHeader";
import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "gallery", label: "Gallery" },
  { id: "categories", label: "Categories" },
  { id: "business-hours", label: "Business Hours" },
  { id: "business-info", label: "Business Info" },
  { id: "location", label: "Location" },
];

export default function VendorProfilePage() {
  const router = useRouter();
  const { selectedVendor } = useStoreStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const tabRefs = useRef<{ [key: string]: View | null }>({});

  // Check if vendor is showcase-only
  const isShowcaseOnly =
    selectedVendor?.attributeValues?.find(
      (attr: any) => attr?.name === "isShowcaseOnly"
    )?.value === "true";

  const handleBack = () => {
    // Go to home page for showcase-only vendors, otherwise go to store
    if (isShowcaseOnly) {
      router.push("/");
    } else {
      router.push("/store");
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    // Center the active tab
    setTimeout(() => {
      if (tabRefs.current[tabId] && tabScrollRef.current) {
        tabRefs.current[tabId]?.measureLayout(
          tabScrollRef.current as any,
          (x: number, _y: number, width: number) => {
            // Calculate the center position
            const centerOffset = x - SCREEN_WIDTH / 2 + width / 2;
            tabScrollRef.current?.scrollTo({
              x: Math.max(0, centerOffset),
              animated: true,
            });
          },
          () => {}
        );
      }
    }, 100);
  };

  useEffect(() => {
    if (!selectedVendor) {
      router.back();
      return;
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedVendor]);

  // Center the active tab when it changes
  useEffect(() => {
    if (!isLoading && activeTab) {
      setTimeout(() => {
        if (tabRefs.current[activeTab] && tabScrollRef.current) {
          tabRefs.current[activeTab]?.measureLayout(
            tabScrollRef.current as any,
            (x: number, _y: number, width: number) => {
              // Calculate the center position
              const centerOffset = x - SCREEN_WIDTH / 2 + width / 2;
              tabScrollRef.current?.scrollTo({
                x: Math.max(0, centerOffset),
                animated: true,
              });
            },
            () => {}
          );
        }
      }, 200);
    }
  }, [activeTab, isLoading]);

  if (!selectedVendor) {
    return null;
  }

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-2">
              Loading vendor profile...
            </Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Back Button */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="ml-2 text-base font-semibold text-gray-800">
              {isShowcaseOnly ? "Back to Home" : "Back to Store"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <VendorProfileHeader vendor={selectedVendor} />

          {/* Tab Navigation */}
          <View className="bg-white border-b border-gray-200">
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4"
              decelerationRate="fast"
            >
              {tabs.map((tab) => (
                <View
                  key={tab.id}
                  ref={(ref: any) => (tabRefs.current[tab.id] = ref)}
                  collapsable={false}
                >
                  <TouchableOpacity
                    onPress={() => handleTabChange(tab.id)}
                    className={`mr-6 py-3 ${
                      activeTab === tab.id
                        ? "border-b-2 border-orange-500"
                        : "border-b-2 border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        activeTab === tab.id
                          ? "text-orange-500"
                          : "text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Tab Content - Keep WebView components mounted, conditionally render others */}
          <View className="flex-1">
            {/* Overview - Always mounted to preserve WebView */}
            <View
              style={{ display: activeTab === "overview" ? "flex" : "none" }}
            >
              <VendorOverview vendor={selectedVendor} />
            </View>

            {/* Gallery - Conditionally rendered */}
            {activeTab === "gallery" && (
              <VendorGallery vendor={selectedVendor} />
            )}

            {/* Categories - Conditionally rendered */}
            {activeTab === "categories" && (
              <VendorCategories vendor={selectedVendor} />
            )}

            {/* Business Hours - Conditionally rendered */}
            {activeTab === "business-hours" && (
              <VendorBusinessHours vendor={selectedVendor} />
            )}

            {/* Business Info - Conditionally rendered */}
            {activeTab === "business-info" && (
              <VendorBusinessInfo vendor={selectedVendor} />
            )}

            {/* Location - Conditionally rendered to avoid MapView duplicate registration */}
            {activeTab === "location" && (
              <VendorLocation vendor={selectedVendor} />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
