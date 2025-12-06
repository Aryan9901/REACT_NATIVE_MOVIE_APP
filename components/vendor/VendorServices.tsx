import { getSubCategoryIcon } from "@/constants/categoryIcons";
import { getServiceDescription } from "@/constants/serviceDescriptions";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface VendorServicesProps {
  vendor: any;
}

// Helper functions
function getName(node: any) {
  const keys = ["name", "categoryName", "title"];
  for (const k of keys) {
    if (node && node[k]) return node[k];
  }
  return "Service";
}

function getChildren(node: any) {
  const keys = ["subCategories", "children", "items"];
  for (const k of keys) {
    if (Array.isArray(node?.[k])) return node[k];
  }
  return [];
}

export default function VendorServices({ vendor }: VendorServicesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const categories = vendor?.vendorCategories || [];
  const contactNo = vendor?.contactNo || "";

  // Flatten all subcategories for search
  const getAllSubCategories = () => {
    const allSubs: any[] = [];
    categories.forEach((cat: any) => {
      const subCategories = getChildren(cat);
      subCategories.forEach((sub: any) => {
        allSubs.push({ ...sub, parentCategory: cat });
      });
    });
    return allSubs;
  };

  // Search logic
  const searchResults = searchQuery.trim()
    ? getAllSubCategories().filter((sub: any) =>
        getName(sub).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleCall = (serviceName: string) => {
    if (contactNo) {
      Linking.openURL(`tel:${contactNo}`);
    }
  };

  const handleWhatsApp = (serviceName: string) => {
    if (contactNo) {
      const message = encodeURIComponent(
        `Hi, I'm interested in your ${serviceName} service. Please provide more details.`
      );
      Linking.openURL(`https://wa.me/${contactNo}?text=${message}`);
    }
  };

  const isSearching = searchQuery.trim().length > 0;

  if (categories.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 mt-4 text-center">
          No services available
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Title and Search */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-3">
          Our Services
        </Text>
        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-sm"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {isSearching ? (
          // Search Results
          <View>
            <Text className="text-sm text-gray-600 mb-3">
              {searchResults.length} results found
            </Text>
            {searchResults.length === 0 ? (
              <View className="py-20 px-4 items-center">
                <Text className="font-semibold text-lg text-gray-700">
                  No Results Found
                </Text>
                <Text className="text-sm mt-2 text-gray-500 text-center">
                  We couldn't find any services matching your search.
                </Text>
              </View>
            ) : (
              searchResults.map((sub: any, index: number) => (
                <ServiceCard
                  key={index}
                  service={sub}
                  contactNo={contactNo}
                  onCall={handleCall}
                  onWhatsApp={handleWhatsApp}
                />
              ))
            )}
          </View>
        ) : (
          // Category Groups
          categories.map((category: any) => {
            const categoryName = getName(category);
            const subCategories = getChildren(category);
            if (subCategories.length === 0) return null;

            return (
              <View key={categoryName} className="mb-6">
                {subCategories.map((subCat: any) => {
                  const subCatName = getName(subCat);
                  const isExpanded = expandedCategories.has(subCatName);
                  const subSubCategories = getChildren(subCat);
                  const hasChildren = subSubCategories.length > 0;

                  return (
                    <SubCategorySection
                      key={subCatName}
                      subCategory={subCat}
                      isExpanded={isExpanded}
                      hasChildren={hasChildren}
                      onToggle={() => toggleCategory(subCatName)}
                      contactNo={contactNo}
                      onCall={handleCall}
                      onWhatsApp={handleWhatsApp}
                    />
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// SubCategory Section Component
function SubCategorySection({
  subCategory,
  isExpanded,
  hasChildren,
  onToggle,
  contactNo,
  onCall,
  onWhatsApp,
}: any) {
  const subCatName = getName(subCategory);
  const subCatDescription = getServiceDescription(subCatName);
  const subSubCategories = getChildren(subCategory);
  const iconSource = getSubCategoryIcon(subCatName);

  return (
    <View className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden border border-gray-200">
      <TouchableOpacity
        onPress={hasChildren ? onToggle : undefined}
        className="p-4"
        disabled={!hasChildren}
        activeOpacity={hasChildren ? 0.7 : 1}
      >
        <View className="flex-row items-start gap-3">
          {/* Image */}
          <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
            {iconSource ? (
              <Image
                source={iconSource}
                className="w-14 h-14"
                resizeMode="contain"
              />
            ) : (
              <Ionicons name="briefcase-outline" size={28} color="#9CA3AF" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-2">
              <Text className="text-base font-bold text-gray-800 flex-1 pr-2">
                {subCatName}
              </Text>
              {hasChildren && (
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#9CA3AF"
                />
              )}
            </View>

            {/* Description */}
            <View className="mb-2">
              <ServiceDescription description={subCatDescription} />
            </View>

            {/* Action Buttons - Show if no children */}
            {!hasChildren && (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onCall(subCatName)}
                  className="flex-row items-center bg-emerald-600 px-3 py-2 rounded-md"
                >
                  <Ionicons name="call" size={16} color="white" />
                  <Text className="text-white text-sm font-medium ml-1">
                    Call
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onWhatsApp(subCatName)}
                  className="flex-row items-center bg-green-600 px-3 py-2 rounded-md"
                >
                  <Ionicons name="logo-whatsapp" size={16} color="white" />
                  <Text className="text-white text-sm font-medium ml-1">
                    WhatsApp
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Sub-subcategories */}
      {isExpanded && hasChildren && (
        <View className="border-t border-gray-200 bg-gray-50 p-4">
          <View className="gap-3">
            {subSubCategories.map((subSubCat: any) => (
              <ServiceCard
                key={getName(subSubCat)}
                service={subSubCat}
                contactNo={contactNo}
                onCall={onCall}
                onWhatsApp={onWhatsApp}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// Service Card Component
function ServiceCard({ service, contactNo, onCall, onWhatsApp }: any) {
  const name = getName(service);
  const description = getServiceDescription(name);
  const iconSource = getSubCategoryIcon(name);

  return (
    <View className="bg-white rounded-lg border border-gray-200 p-3 mb-2">
      <View className="flex-row items-start gap-3 mb-2">
        {/* Image */}
        <View className="w-14 h-14 bg-gray-100 rounded-lg items-center justify-center flex-shrink-0">
          {iconSource ? (
            <Image
              source={iconSource}
              className="w-12 h-12"
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="briefcase-outline" size={24} color="#9CA3AF" />
          )}
        </View>

        {/* Title */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{name}</Text>
        </View>
      </View>

      {/* Description */}
      <View className="mb-2">
        <ServiceDescription description={description} />
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onCall(name)}
          className="flex-row items-center bg-emerald-600 px-3 py-2 rounded-md"
        >
          <Ionicons name="call" size={16} color="white" />
          <Text className="text-white text-sm font-medium ml-1">Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onWhatsApp(name)}
          className="flex-row items-center bg-green-600 px-3 py-2 rounded-md"
        >
          <Ionicons name="logo-whatsapp" size={16} color="white" />
          <Text className="text-white text-sm font-medium ml-1">WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Service Description Component with WebView
function ServiceDescription({ description }: { description: string }) {
  const [webViewHeight, setWebViewHeight] = useState(50);

  return (
    <View style={{ height: webViewHeight, overflow: "hidden" }}>
      <WebView
        originWhitelist={["*"]}
        source={{
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                  * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                  }
                  html, body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 13px;
                    color: #4B5563;
                    line-height: 1.4;
                    overflow: hidden;
                    height: auto;
                  }
                  p {
                    margin-bottom: 6px;
                  }
                  p:last-child {
                    margin-bottom: 0;
                  }
                  ul {
                    margin: 0;
                    padding-left: 18px;
                    margin-bottom: 0;
                  }
                  li {
                    margin-bottom: 2px;
                    line-height: 1.3;
                  }
                  li:last-child {
                    margin-bottom: 0;
                  }
                  strong {
                    font-weight: 600;
                    color: #1F2937;
                  }
                </style>
                <script>
                  function updateHeight() {
                    const height = document.documentElement.scrollHeight;
                    window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
                  }
                  
                  window.onload = updateHeight;
                  
                  // Fallback in case onload doesn't fire
                  setTimeout(updateHeight, 100);
                </script>
              </head>
              <body>
                ${description}
              </body>
            </html>
          `,
        }}
        style={{
          backgroundColor: "transparent",
          height: webViewHeight,
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        androidLayerType="software"
        javaScriptEnabled={true}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.height && data.height > 0) {
              // Add a small buffer (5px) to prevent cutoff
              setWebViewHeight(data.height + 5);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }}
      />
    </View>
  );
}
