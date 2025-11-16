import { getSubCategoryIcon } from "@/constants/categoryIcons";
import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VendorCategoriesProps {
  vendor: any;
}

export default function VendorCategories({ vendor }: VendorCategoriesProps) {
  const router = useRouter();
  const { selectedVendor, setSelectedCategory } = useStoreStore();
  const [searchQuery, setSearchQuery] = useState("");

  const categories = vendor?.vendorCategories || [];

  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const isShowcaseOnly =
    getAttributeValue("isShowcaseOnly")?.toLowerCase() === "true";

  // Flatten all subcategories for search
  const getAllSubCategories = () => {
    const allSubs: any[] = [];
    categories.forEach((cat: any) => {
      if (cat.subCategories) {
        cat.subCategories.forEach((sub: any) => {
          allSubs.push({ ...sub, parentCategory: cat });
        });
      }
    });
    return allSubs;
  };

  const filteredCategories = searchQuery
    ? getAllSubCategories().filter((sub: any) =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleCategoryClick = (category: any, subCategory?: any) => {
    if (isShowcaseOnly) return;

    // Set the selected category and subcategory in the store
    setSelectedCategory(category, subCategory);

    // Navigate to store page
    router.push("/store");
  };

  if (categories.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <Ionicons name="grid-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 mt-4 text-center">
          No categories available
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search categories..."
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
        {searchQuery ? (
          // Search Results
          <View>
            <Text className="text-sm text-gray-600 mb-3">
              {filteredCategories.length} results found
            </Text>
            <View className="flex-row flex-wrap">
              {filteredCategories.map((sub: any) => (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleCategoryClick(sub.parentCategory, sub)}
                  className="w-1/3 p-2"
                  disabled={isShowcaseOnly}
                >
                  <View className="bg-white rounded-lg p-3 items-center shadow-sm">
                    <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
                      {getSubCategoryIcon(sub.name) ? (
                        <Image
                          source={getSubCategoryIcon(sub.name)}
                          className="w-12 h-12"
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={28}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                    <Text
                      className="text-xs text-center text-gray-800 font-medium"
                      numberOfLines={2}
                    >
                      {sub.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          // Category Groups
          categories.map((category: any) => (
            <View key={category.id} className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                {category.name}
              </Text>
              <View className="flex-row flex-wrap">
                {category.subCategories?.map((sub: any) => (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => handleCategoryClick(category, sub)}
                    className="w-1/3 p-2"
                    disabled={isShowcaseOnly}
                  >
                    <View className="bg-white rounded-lg p-3 items-center shadow-sm">
                      <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-2">
                        {getSubCategoryIcon(sub.name) ? (
                          <Image
                            source={getSubCategoryIcon(sub.name)}
                            className="w-12 h-12"
                            resizeMode="contain"
                          />
                        ) : (
                          <Ionicons
                            name="cube-outline"
                            size={28}
                            color="#9CA3AF"
                          />
                        )}
                      </View>
                      <Text
                        className="text-xs text-center text-gray-800 font-medium"
                        numberOfLines={2}
                      >
                        {sub.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
