import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProductCardProps {
  product: any;
  category?: string;
  subCategory?: any;
}

export default function ProductCard({
  product,
  category,
  subCategory,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cart, removeFromCart, updateCartQuantity }: any =
    useStoreStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [hasManuallySelected, setHasManuallySelected] = useState(false);

  // Get available variants
  const availableVariants = useMemo(
    () =>
      product?.productVariants?.filter((v: any) => v?.available === true) || [],
    [product?.productVariants]
  );

  const validSelectedIndex = Math.min(
    selectedVariantIndex,
    availableVariants.length - 1
  );
  const selectedVariant = availableVariants[validSelectedIndex];

  // Extract variant name from image URL (last part before extension)
  const extractVariantFromImageUrl = (imageUrl: string): string => {
    try {
      // Handle both encoded (%2F) and regular (/) paths
      const parts = imageUrl.split(/[/%]2F/);
      const lastPart = parts[parts.length - 1];
      // Remove file extension and any query parameters
      const variantName = lastPart.split(/[.?]/)[0];
      return variantName.toLowerCase().trim();
    } catch {
      return "";
    }
  };

  // Find matching image URL for a variant
  const findMatchingImageUrl = (variantName: string): string => {
    if (!variantName || !product?.productImageUrls) {
      const images = Array.isArray(product?.productImageUrls)
        ? product.productImageUrls
        : [product?.productImageUrls || null];
      return images[0] || null;
    }

    const normalizedVariant = variantName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");
    const images = Array.isArray(product.productImageUrls)
      ? product.productImageUrls
      : [product.productImageUrls];

    // Try exact match first
    let matchingImage = images.find((imageUrl: string) => {
      const imageVariant = extractVariantFromImageUrl(imageUrl).replace(
        /\s+/g,
        ""
      );
      return imageVariant === normalizedVariant;
    });

    // If no exact match, try partial match
    if (!matchingImage) {
      matchingImage = images.find((imageUrl: string) => {
        const imageVariant = extractVariantFromImageUrl(imageUrl).replace(
          /\s+/g,
          ""
        );
        return (
          imageVariant.includes(normalizedVariant) ||
          normalizedVariant.includes(imageVariant)
        );
      });
    }

    return matchingImage || images[0] || null;
  };

  // Get the image that matches the selected variant
  const displayImage = useMemo(() => {
    if (!selectedVariant?.variant) {
      return product?.productImageUrls?.[0] || null;
    }
    return findMatchingImageUrl(selectedVariant.variant);
  }, [selectedVariant, product?.productImageUrls]);

  // Get cart item for selected variant
  const cartItem = cart.find(
    (item: any) => item.variantId === selectedVariant?.variantId
  );
  const quantityInCart = cartItem?.quantity || 0;

  // Calculate discount
  const discount = useMemo(() => {
    if (!selectedVariant) return 0;
    const mrp = selectedVariant.mrp;
    const netPrice = selectedVariant.netPrice;
    return mrp && netPrice ? Math.round(((mrp - netPrice) / mrp) * 100) : 0;
  }, [selectedVariant]);

  const handleAddToCart = async () => {
    if (!selectedVariant?.available) return;

    setIsAdding(true);
    try {
      addToCart({
        productId: product.productId,
        name: product.productName,
        price: selectedVariant.netPrice,
        quantity: 1,
        productImageUrls: displayImage,
        variant: selectedVariant.variant,
        variantId: selectedVariant.variantId,
        unit: selectedVariant.unit,
        mrp: selectedVariant.mrp,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async () => {
    if (quantityInCart >= 9) return;

    setIsAdding(true);
    try {
      await addToCart({
        productId: product.productId,
        name: product.productName,
        price: selectedVariant.netPrice,
        quantity: quantityInCart + 1,
        productImageUrls: displayImage,
        variant: selectedVariant.variant,
        variantId: selectedVariant.variantId,
        unit: selectedVariant.unit,
        mrp: selectedVariant.mrp,
      });
    } catch (error) {
      console.error("Error incrementing:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDecrement = async () => {
    setIsAdding(true);
    try {
      if (quantityInCart <= 1) {
        removeFromCart(selectedVariant.variantId);
      } else {
        updateCartQuantity(selectedVariant.variantId, quantityInCart - 1);
      }
    } catch (error) {
      console.error("Error decrementing:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setHasManuallySelected(true);
    setShowVariantModal(false);

    const newVariant = availableVariants[index];
    const isInCart = cart.find(
      (item: any) => item?.variantId === newVariant?.variantId
    );

    if (!isInCart) {
      // addToCart({
      //   id: newVariant.variantId,
      //   productId: product.productId,
      //   name: product.productName,
      //   price: newVariant.netPrice,
      //   quantity: 1,
      //   image: findMatchingImageUrl(newVariant.variant),
      //   variant: newVariant.variant,
      //   variantId: newVariant.variantId,
      //   unit: newVariant.unit,
      //   mrp: newVariant.mrp,
      //   netPrice: newVariant.netPrice,
      // });
    }
  };

  const handleProductPress = async () => {
    try {
      await AsyncStorage.setItem("selectedProduct", JSON.stringify(product));
      if (subCategory) {
        await AsyncStorage.setItem(
          "selectedSubCategory",
          JSON.stringify(subCategory)
        );
      }
      router.push("/product-details");
    } catch (error) {
      console.error("Error storing product data:", error);
    }
  };

  // Sync selected variant with cart on mount
  useEffect(() => {
    if (!hasManuallySelected) {
      const cartItem = cart.find(
        (item: any) => item?.productId === product?.productId
      );
      if (cartItem) {
        const variantIndex = availableVariants.findIndex(
          (variant: any) => variant?.variantId === cartItem?.variantId
        );
        if (variantIndex !== -1) {
          setSelectedVariantIndex(variantIndex);
        }
      }
    }
  }, [cart, product?.productId, availableVariants, hasManuallySelected]);

  // Reset index if out of bounds
  useEffect(() => {
    if (
      selectedVariantIndex >= availableVariants.length &&
      availableVariants.length > 0
    ) {
      setSelectedVariantIndex(0);
    }
  }, [availableVariants.length, selectedVariantIndex]);

  // Don't render if no available variants or selectedVariant is undefined
  if (!availableVariants.length || !selectedVariant) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        onPress={handleProductPress}
        activeOpacity={0.9}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
      >
        {/* Product Image */}
        <View className="relative">
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              className="w-full h-32"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-32 bg-gray-100 items-center justify-center">
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          {discount > 0 && category !== "Dairy" && (
            <View className="absolute top-2 left-2 bg-red-500 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-semibold">
                Save {discount}%
              </Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-2">
          <Text
            className="text-sm font-semibold text-gray-900 mb-2 leading-tight"
            numberOfLines={2}
          >
            {product.productName}
          </Text>

          {/* Variant Selection & Price Row */}
          <View className="flex-row items-center justify-between mb-1.5">
            {availableVariants.length > 1 ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setShowVariantModal(true);
                }}
                className="border border-gray-300 rounded-lg pl-3 pr-2 py-1.5 flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-[10px] text-gray-700 mr-0.5 font-medium">
                  {selectedVariant?.variant} {selectedVariant?.unit}
                </Text>
                <Ionicons name="chevron-down" size={10} color="#374151" />
              </TouchableOpacity>
            ) : (
              <Text className="text-[10px] text-gray-600 font-medium">
                {selectedVariant?.variant} {selectedVariant?.unit}
              </Text>
            )}
          </View>

          {/* Price */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center flex-wrap">
              <Text className="text-sm font-bold text-gray-900">
                ₹{selectedVariant?.netPrice}
              </Text>
              {selectedVariant?.mrp > selectedVariant?.netPrice && (
                <Text className="text-[10px] text-gray-400 line-through ml-1">
                  ₹{selectedVariant?.mrp}
                </Text>
              )}
            </View>
          </View>

          {/* Add to Cart Button */}
          {selectedVariant?.available && (
            <>
              {quantityInCart === 0 ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className="bg-orange-100 w-16 h-7 ml-auto border border-orange-600 rounded-full items-center justify-center"
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#ea580c" />
                  ) : (
                    <Text className="text-orange-600 text-xs font-bold">
                      ADD
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View className="flex-row w-24 h-7 ml-auto items-center justify-between bg-orange-100 border border-orange-600 rounded-full px-1">
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDecrement();
                    }}
                    className="w-8 h-8 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={18} color="#ea580c" />
                  </TouchableOpacity>
                  <Text className="text-orange-600 font-bold text-sm px-1">
                    {quantityInCart}
                  </Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleIncrement();
                    }}
                    disabled={isAdding}
                    className="w-8 h-8 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color="#ea580c" />
                    ) : (
                      <Ionicons name="add" size={18} color="#ea580c" />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Variant Selection Modal */}
      <Modal
        visible={showVariantModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVariantModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowVariantModal(false)}
            className="flex-1"
          />
          <View className="bg-white rounded-t-2xl max-h-[70%]">
            <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Select Variant
              </Text>
              <TouchableOpacity
                onPress={() => setShowVariantModal(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {availableVariants.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-gray-500">No variants available</Text>
                </View>
              ) : (
                availableVariants.map((variant: any, index: number) => {
                  const isSelected = index === validSelectedIndex;
                  const variantInCart = cart.find(
                    (item: any) => item?.variantId === variant?.variantId
                  );
                  const variantQuantity = variantInCart?.quantity || 0;
                  const variantDiscount =
                    variant.mrp && variant.netPrice
                      ? Math.round(
                          ((variant.mrp - variant.netPrice) / variant.mrp) * 100
                        )
                      : 0;

                  const handleModalAdd = (e: any) => {
                    e.stopPropagation();
                    addToCart({
                      productId: product.productId,
                      name: product.productName,
                      price: variant.netPrice,
                      quantity: 1,
                      productImageUrls: findMatchingImageUrl(variant.variant),
                      variant: variant.variant,
                      variantId: variant.variantId,
                      unit: variant.unit,
                      mrp: variant.mrp,
                    });
                    if (!isSelected) {
                      setSelectedVariantIndex(index);
                      setHasManuallySelected(true);
                    }
                  };

                  const handleModalIncrement = (e: any) => {
                    e.stopPropagation();
                    if (variantQuantity >= 9) return;
                    addToCart({
                      productId: product.productId,
                      name: product.productName,
                      price: variant.netPrice,
                      quantity: variantQuantity + 1,
                      productImageUrls: findMatchingImageUrl(variant.variant),
                      variant: variant.variant,
                      variantId: variant.variantId,
                      unit: variant.unit,
                      mrp: variant.mrp,
                    });
                  };

                  const handleModalDecrement = (e: any) => {
                    e.stopPropagation();
                    if (variantQuantity <= 1) {
                      removeFromCart(variant.variantId);
                    } else {
                      updateCartQuantity(
                        variant.variantId,
                        variantQuantity - 1
                      );
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={variant.variantId}
                      onPress={() => handleVariantChange(index)}
                      className={`p-4 border-b border-gray-100 ${
                        isSelected
                          ? "bg-orange-100 border-l-4 border-l-orange-500"
                          : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1 mr-3">
                          <View className="flex-row items-center mb-1">
                            <Text
                              className={`text-base font-bold ${
                                isSelected ? "text-orange-700" : "text-gray-900"
                              }`}
                            >
                              {variant.variant} {variant.unit}
                            </Text>
                            {/* {isSelected && (
                              <View className="ml-2 bg-orange-500 rounded-full px-2 py-0.5">
                                <Text className="text-white text-[10px] font-bold">
                                  SELECTED
                                </Text>
                              </View>
                            )} */}
                            {isSelected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#f97316"
                                style={{ marginTop: 4 }}
                              />
                            )}
                          </View>
                          <View className="flex-row items-center flex-wrap">
                            <Text className="text-base font-bold text-gray-900 mr-2">
                              ₹{variant.netPrice}
                            </Text>
                            {variant.mrp !== variant.netPrice && (
                              <>
                                <Text className="text-sm text-gray-500 line-through mr-2">
                                  ₹{variant.mrp}
                                </Text>
                                {variantDiscount > 0 && (
                                  <Text className="text-xs text-green-600 font-semibold">
                                    {variantDiscount}% OFF
                                  </Text>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                        <View className="items-center">
                          {variantQuantity === 0 ? (
                            <TouchableOpacity
                              onPress={handleModalAdd}
                              className="bg-orange-100 w-16 h-6 py-0 border border-orange-600 rounded-full items-center justify-center"
                              activeOpacity={0.7}
                            >
                              <Text className="text-orange-600 text-xs font-bold">
                                ADD
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <View className="flex-row w-24 h-9 items-center justify-between bg-orange-100 border border-orange-600 rounded-full px-1">
                              <TouchableOpacity
                                onPress={handleModalDecrement}
                                className="w-8 h-8 items-center justify-center"
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name="remove"
                                  size={18}
                                  color="#ea580c"
                                />
                              </TouchableOpacity>
                              <Text className="text-orange-600 font-bold text-sm px-1">
                                {variantQuantity}
                              </Text>
                              <TouchableOpacity
                                onPress={handleModalIncrement}
                                className="w-8 h-8 items-center justify-center"
                                activeOpacity={0.7}
                              >
                                <Ionicons
                                  name="add"
                                  size={18}
                                  color="#ea580c"
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
