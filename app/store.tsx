import FilterModal from "@/components/FilterModal";
import Header from "@/components/Header";
import { getSubCategoryIcon } from "@/constants/categoryIcons";
import { productService } from "@/services/product.service";
import { useAuthStore, useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ProductCard from "../components/ProductCard";

const getLeafNodes = (nodes: any[]) => {
  const leafNodes: any[] = [];
  const traverse = (nodeList: any[]) => {
    if (!nodeList || nodeList.length === 0) return;
    nodeList.forEach((node: any) => {
      if (node.available) {
        if (node.subCategories && node.subCategories.length > 0) {
          traverse(node.subCategories);
        } else {
          leafNodes.push(node);
        }
      }
    });
  };
  traverse(nodes);
  return leafNodes;
};

export default function StorePage() {
  const router = useRouter();
  const { user, isGuestMode } = useAuthStore();
  const {
    selectedVendor,
    cartItemCount,
    selectedCategory: storeSelectedCategory,
    selectedSubCategory: storeSelectedSubCategory,
    setSelectedCategory,
  } = useStoreStore();

  const categoryScrollRef = useRef<ScrollView>(null);
  const subCategoryScrollRef = useRef<ScrollView>(null);
  const categoryRefs = useRef<{ [key: string]: View | null }>({});
  const subCategoryRefs = useRef<{ [key: string]: View | null }>({});

  // Check if vendor is showcase-only
  const isShowcaseOnly =
    selectedVendor?.attributeValues?.find(
      (attr: any) => attr?.name === "isShowcaseOnly"
    )?.value === "true";

  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );
  const [availableFilters, setAvailableFilters] = useState<
    Record<string, string[]>
  >({});

  const FILTERABLE_ATTRIBUTES = ["Colour", "Size", "Material", "Tag"];
  const PRODUCT_FILTER_KEYS = { BRAND: "brand" };

  const loadProducts = async () => {
    if (!selectedVendor || !activeCategory || !selectedSubCategory) return;

    try {
      setIsLoading(true);
      const result = await productService.fetchProducts(
        selectedSubCategory.id,
        selectedVendor.id
      );

      if (result.success) {
        setProducts(result.data);
        setIsEmpty(result.isEmpty || false);
        extractAvailableFilters(result.data);
      } else {
        setProducts([]);
        setIsEmpty(false);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractAvailableFilters = (productsData: any[]) => {
    const filters: Record<string, Set<string>> = {};
    FILTERABLE_ATTRIBUTES.forEach((attr) => {
      filters[attr] = new Set();
    });
    filters[PRODUCT_FILTER_KEYS.BRAND] = new Set();

    productsData.forEach((product: any) => {
      if (product.productAttributes) {
        product.productAttributes.forEach((attr: any) => {
          if (FILTERABLE_ATTRIBUTES.includes(attr.name) && attr.value) {
            filters[attr.name].add(attr.value);
          }
        });
      }
      if (product.brand && product.brand.trim()) {
        filters[PRODUCT_FILTER_KEYS.BRAND].add(product.brand);
      }
    });

    const filterOptions: Record<string, string[]> = {};
    Object.keys(filters).forEach((key) => {
      filterOptions[key] = Array.from(filters[key]).sort();
    });
    setAvailableFilters(filterOptions);
  };

  const applyFilters = (productsData: any[]) => {
    let filtered = productsData;

    if (searchQuery) {
      filtered = filtered.filter((p: any) =>
        p?.productName?.toLowerCase().includes(searchQuery?.toLowerCase())
      );
    }

    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((product: any) => {
        return Object.entries(activeFilters).every(
          ([filterKey, filterValues]) => {
            if (filterValues.length === 0) return true;

            if (filterKey === PRODUCT_FILTER_KEYS.BRAND) {
              return filterValues.includes(product.brand);
            }

            if (product.productAttributes) {
              const attribute = product.productAttributes.find(
                (attr: any) => attr.name === filterKey
              );
              return attribute && filterValues.includes(attribute.value);
            }
            return false;
          }
        );
      });
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (
    filterKey: string,
    value: string,
    isChecked: boolean
  ) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[filterKey]) {
        newFilters[filterKey] = [];
      }
      if (isChecked) {
        newFilters[filterKey] = [...newFilters[filterKey], value];
      } else {
        newFilters[filterKey] = newFilters[filterKey].filter(
          (v) => v !== value
        );
      }
      if (newFilters[filterKey].length === 0) {
        delete newFilters[filterKey];
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce(
      (count, filterArray) => count + filterArray.length,
      0
    );
  };

  const handleCategoryChange = (category: any) => {
    setActiveCategory(category);
    setSearchQuery("");
    clearAllFilters();
    const leafSubCategories = getLeafNodes(category?.subCategories || []);
    setSubCategories(leafSubCategories);
    setSelectedSubCategory(
      leafSubCategories.length > 0 ? leafSubCategories[0] : null
    );

    // Scroll category into view - centered
    setTimeout(() => {
      if (categoryRefs.current[category.id] && categoryScrollRef.current) {
        categoryRefs.current[category.id]?.measureLayout(
          categoryScrollRef.current as any,
          (x: number, _y: number, width: number) => {
            categoryScrollRef.current?.scrollTo({
              x: x - 120, // Offset to center better
              animated: true,
            });
          },
          () => {}
        );
      }
    }, 100);
  };

  const handleSubCategoryChange = (subCategory: any) => {
    setSelectedSubCategory(subCategory);

    // Scroll subcategory into view - centered
    setTimeout(() => {
      if (
        subCategoryRefs.current[subCategory.id] &&
        subCategoryScrollRef.current
      ) {
        subCategoryRefs.current[subCategory.id]?.measureLayout(
          subCategoryScrollRef.current as any,
          (_x: number, y: number, _width: number, height: number) => {
            subCategoryScrollRef.current?.scrollTo({
              y: y - 150, // Offset to center in viewport
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

    // Redirect to profile page if vendor is showcase-only
    if (isShowcaseOnly) {
      router.replace("/vendor/profile");
      return;
    }

    const availableCategories = selectedVendor.vendorCategories.filter(
      (cat: any) => cat.available
    );
    setCategories(availableCategories);

    if (availableCategories.length > 0) {
      // Check if there's a pre-selected category from the store
      if (storeSelectedCategory && storeSelectedSubCategory) {
        setActiveCategory(storeSelectedCategory);
        const leafSubCategories = getLeafNodes(
          storeSelectedCategory?.subCategories || []
        );
        setSubCategories(leafSubCategories);
        setSelectedSubCategory(storeSelectedSubCategory);

        // Clear the stored selection after using it
        setSelectedCategory(null, null);

        // Scroll to selected category and subcategory
        setTimeout(() => {
          if (
            categoryRefs.current[storeSelectedCategory.id] &&
            categoryScrollRef.current
          ) {
            categoryRefs.current[storeSelectedCategory.id]?.measureLayout(
              categoryScrollRef.current as any,
              (x: number, _y: number, width: number) => {
                categoryScrollRef.current?.scrollTo({
                  x: x - 120,
                  animated: true,
                });
              },
              () => {}
            );
          }

          if (
            subCategoryRefs.current[storeSelectedSubCategory.id] &&
            subCategoryScrollRef.current
          ) {
            subCategoryRefs.current[storeSelectedSubCategory.id]?.measureLayout(
              subCategoryScrollRef.current as any,
              (_x: number, y: number, _width: number, height: number) => {
                subCategoryScrollRef.current?.scrollTo({
                  y: y - 150,
                  animated: true,
                });
              },
              () => {}
            );
          }
        }, 300);
      } else {
        // Default to first category
        const initialCategory = availableCategories[0];
        setActiveCategory(initialCategory);
        const leafSubCategories = getLeafNodes(
          initialCategory?.subCategories || []
        );
        setSubCategories(leafSubCategories);
        setSelectedSubCategory(
          leafSubCategories.length > 0 ? leafSubCategories[0] : null
        );

        // Scroll to initial positions
        setTimeout(() => {
          categoryScrollRef.current?.scrollTo({ x: 0, animated: false });
          subCategoryScrollRef.current?.scrollTo({ y: 0, animated: false });
        }, 100);
      }
    }
    setIsLoading(false);
  }, [selectedVendor]);

  useEffect(() => {
    if (activeCategory && selectedSubCategory) {
      loadProducts();
    }
  }, [activeCategory, selectedSubCategory]);

  useEffect(() => {
    applyFilters(products);
  }, [products, searchQuery, activeFilters]);

  if (!selectedVendor) {
    return null;
  }

  return (
    <View className=" bg-gray-50">
      <Header />
      <View className="bg-white border-b border-gray-200 pt-2 pb-3 px-4">
        {categories.length > 0 && (
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-2"
            snapToInterval={120}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            {categories.map((category: any) => (
              <View
                key={category.id}
                ref={(ref: any) => (categoryRefs.current[category.id] = ref)}
                collapsable={false}
              >
                <TouchableOpacity
                  onPress={() => handleCategoryChange(category)}
                  className={`mr-4 pb-2 ${
                    activeCategory?.id === category.id
                      ? "border-b-2 border-orange-500"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      activeCategory?.id === category.id
                        ? "text-orange-500"
                        : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-sm"
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 justify-center items-center"
          >
            <Ionicons name="filter" size={20} color="#374151" />
            {getActiveFilterCount() > 0 && (
              <View className="absolute -top-1 -right-1 bg-orange-600 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {getActiveFilterCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {getActiveFilterCount() > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
          >
            {Object.entries(activeFilters).map(([filterKey, values]) =>
              values.map((value) => (
                <View
                  key={`${filterKey}-${value}`}
                  className="flex-row items-center bg-orange-100 rounded-full px-3 py-1 mr-2"
                >
                  <Text className="text-xs text-orange-800">{value}</Text>
                  <TouchableOpacity
                    onPress={() => handleFilterChange(filterKey, value, false)}
                    className="ml-1"
                  >
                    <Ionicons name="close" size={14} color="#9A3412" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <View className="flex-row h-full">
        {subCategories.length > 0 && (
          <ScrollView
            ref={subCategoryScrollRef}
            className="w-[20%]  bg-white border-r border-gray-200"
            showsVerticalScrollIndicator={false}
            snapToInterval={100}
            decelerationRate="fast"
            snapToAlignment="start"
          >
            {subCategories.map((subCategory: any) => {
              const isSelected = selectedSubCategory?.id === subCategory.id;
              return (
                <View
                  key={subCategory.id}
                  ref={(ref: any) =>
                    (subCategoryRefs.current[subCategory.id] = ref)
                  }
                  collapsable={false}
                >
                  <TouchableOpacity
                    onPress={() => handleSubCategoryChange(subCategory)}
                    className={`items-center py-2 ${
                      isSelected ? "bg-orange-50" : ""
                    }`}
                  >
                    <View className="size-16 rounded-full bg-gray-100 items-center justify-center mb-1 overflow-hidden">
                      {getSubCategoryIcon(subCategory.name) ? (
                        <Image
                          source={getSubCategoryIcon(subCategory.name)}
                          className="w-full h-full"
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons
                          name="cube-outline"
                          size={24}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                    <Text
                      className={`text-[10px] text-center leading-tight ${
                        isSelected
                          ? "text-orange-600 font-semibold"
                          : "text-gray-700"
                      }`}
                      numberOfLines={2}
                    >
                      {subCategory.name}
                    </Text>
                    {isSelected && (
                      <View className="absolute right-0 top-0 bottom-0 w-1 bg-orange-600 rounded-l-full" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
            <View className="h-96 rounded-full items-center justify-center mb-1 overflow-hidden"></View>
          </ScrollView>
        )}

        <ScrollView className="w-[80%] px-1 py-2">
          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#F97316" />
              <Text className="text-gray-500 mt-2">Loading products...</Text>
            </View>
          ) : isEmpty || filteredProducts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl mb-2">📦</Text>
              <Text className="text-base font-bold text-gray-900 mb-2">
                No Products Found
              </Text>
              <Text className="text-xs text-gray-600 text-center px-4">
                {searchQuery
                  ? "We couldn't find any products matching your search."
                  : `Products in ${activeCategory?.name} category are currently unavailable.`}
              </Text>
            </View>
          ) : (
            <View className="flex-row gap-y-2 flex-wrap">
              {filteredProducts.map((product: any) => (
                <View key={product.productId} className="w-1/2  pr-1">
                  <ProductCard
                    product={product}
                    category={activeCategory?.name}
                    subCategory={selectedSubCategory}
                  />
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        availableFilters={availableFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearAll={clearAllFilters}
      />
    </View>
  );
}
