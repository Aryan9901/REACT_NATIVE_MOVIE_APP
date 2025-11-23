import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Easing } from "react-native-reanimated";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 400;

export default function ProductDetailsPage() {
  const router = useRouter();
  const { addToCart, updateCartQuantity, removeFromCart, cart }: any =
    useStoreStore();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [manuallySelectedImage, setManuallySelectedImage] = useState<
    string | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confettiElements, setConfettiElements] = useState<any[]>([]);

  // Extract variant name from image URL (last part before extension)
  const extractVariantFromImageUrl = (imageUrl: string): string => {
    try {
      // Handle both encoded (%2F) and regular (/) paths
      const parts = imageUrl.split(/[/%]2F/);
      const lastPart = parts[parts.length - 1];
      // Remove file extension and any query parameters
      const variantName = lastPart.split(/[.?]/)[0];
      // Replace + with space (URL encoding) and normalize
      return variantName.replace(/\+/g, " ").toLowerCase().trim();
    } catch {
      return "";
    }
  };

  // Find matching image URL for a variant
  const findMatchingImageUrl = (variantName: string): string | null => {
    if (!variantName || !productImages.length) {
      return productImages[0] || null;
    }

    const normalizedVariant = variantName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");

    // Try exact match first
    let matchingImage = productImages.find((imageUrl: string) => {
      const imageVariant = extractVariantFromImageUrl(imageUrl).replace(
        /\s+/g,
        ""
      );
      return imageVariant === normalizedVariant;
    });

    // If no exact match, try partial match
    if (!matchingImage) {
      matchingImage = productImages.find((imageUrl: string) => {
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

    return matchingImage || productImages[0] || null;
  };

  const variantScrollRef = useRef<ScrollView>(null);
  const imageScrollRef = useRef<ScrollView>(null);
  const modalScrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load product data from AsyncStorage
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setIsLoading(true);
        const [productData, subCategoryData] = await Promise.all([
          AsyncStorage.getItem("selectedProduct"),
          AsyncStorage.getItem("selectedSubCategory"),
        ]);

        if (productData) {
          setProduct(JSON.parse(productData));
        } else {
          // No product data, go back
          router.back();
        }
      } catch (error) {
        console.error("Error loading product data:", error);
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, []);

  // Scroll to selected image when modal opens
  useEffect(() => {
    if (isModalOpen && modalScrollRef.current) {
      setTimeout(() => {
        modalScrollRef.current?.scrollTo({
          x: selectedImageIndex * SCREEN_WIDTH,
          y: 0,
          animated: false,
        });
      }, 100);
    }
  }, [isModalOpen]);

  if (isLoading || !product) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-500 mt-2">Loading product...</Text>
      </View>
    );
  }

  const availableVariants =
    product.productVariants?.filter((v: any) => v.available) || [];
  const selectedVariant = availableVariants[selectedVariantIndex];
  const productImages = Array.isArray(product.productImageUrls)
    ? product.productImageUrls
    : product.productImageUrls
    ? [product.productImageUrls]
    : [];

  // Get the image that matches the selected variant
  const variantMatchedImage = selectedVariant?.variant
    ? findMatchingImageUrl(selectedVariant.variant)
    : productImages[0] || null;

  // Use manually selected image if available, otherwise use variant-matched image
  const displayImage = manuallySelectedImage || variantMatchedImage;

  // Get display image index for thumbnail selection
  const displayImageIndex = displayImage
    ? productImages.indexOf(displayImage)
    : 0;

  const cartItem = cart.find(
    (item: any) =>
      item.productId === product.productId &&
      item.variantId === selectedVariant?.variantId
  );
  const quantity = cartItem?.quantity || 0;

  const savings =
    selectedVariant?.mrp > selectedVariant?.netPrice
      ? {
          amount: selectedVariant.mrp - selectedVariant.netPrice,
          percentage: (
            ((selectedVariant.mrp - selectedVariant.netPrice) /
              selectedVariant.mrp) *
            100
          ).toFixed(0),
        }
      : null;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
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
  };

  const handleIncrement = () => {
    if (!selectedVariant) return;
    addToCart({
      productId: product.productId,
      name: product.productName,
      price: selectedVariant.netPrice,
      quantity: quantity + 1,
      productImageUrls: displayImage,
      variant: selectedVariant.variant,
      variantId: selectedVariant.variantId,
      unit: selectedVariant.unit,
      mrp: selectedVariant.mrp,
    });
  };

  const handleDecrement = () => {
    if (!selectedVariant) return;
    if (quantity <= 1) {
      removeFromCart(selectedVariant.variantId);
    } else {
      updateCartQuantity(selectedVariant.variantId, quantity - 1);
    }
  };

  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    // Reset manually selected image when variant changes
    setManuallySelectedImage(null);

    // Check if the new variant is already in cart
    const newVariant = availableVariants[index];
    const isInCart = cart.some(
      (item: any) =>
        item.productId === product.productId &&
        item.variantId === newVariant?.variantId
    );

    if (!isInCart && newVariant) {
      // Auto-add to cart with quantity 1
      const variantImage = findMatchingImageUrl(newVariant.variant);
      addToCart({
        productId: product.productId,
        name: product.productName,
        price: newVariant.netPrice,
        quantity: 1,
        productImageUrls: variantImage,
        variant: newVariant.variant,
        variantId: newVariant.variantId,
        unit: newVariant.unit,
        mrp: newVariant.mrp,
      });

      // Generate confetti with celebration icons
      const celebrationIcons = [
        "sparkles",
        "flash",
        "star",
        "trophy",
        "rocket",
        "gift",
        "balloon",
        "flame",
        "thunderstorm",
      ];

      const elements = Array.from({ length: 60 }, (_, i) => {
        const isIcon = i % 4 === 0; // Every 4th element is an icon
        return {
          id: `confetti-${Date.now()}-${i}`,
          type: isIcon ? "icon" : "shape",
          icon: isIcon ? celebrationIcons[i % celebrationIcons.length] : null,
          x: new Animated.Value(SCREEN_WIDTH / 2),
          y: new Animated.Value(SCREEN_HEIGHT / 2),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(isIcon ? 0.3 : 1),
          opacity: new Animated.Value(1),
          color: [
            "#F97316",
            "#10B981",
            "#3B82F6",
            "#EF4444",
            "#F59E0B",
            "#8B5CF6",
            "#EC4899",
            "#14B8A6",
            "#FBBF24",
            "#A78BFA",
          ][i % 10],
          shape: isIcon ? null : ["circle", "square"][i % 2],
        };
      });

      setConfettiElements(elements);

      // Start animations immediately on next frame
      requestAnimationFrame(() => {
        // Animate confetti elements with smooth, consistent timing
        elements.forEach((element, i) => {
          // Create evenly distributed burst pattern
          const angle = (Math.PI * 2 * i) / elements.length;
          const distance = 200 + (i % 3) * 50; // Layered distances for depth
          const endX = SCREEN_WIDTH / 2 + Math.cos(angle) * distance;
          const endY = SCREEN_HEIGHT / 2 + Math.sin(angle) * distance;

          // Consistent animation duration for smoothness
          const duration = 1200;
          const fadeDelay = 700;

          if (element.type === "icon") {
            // Icons: Scale up and burst out
            Animated.parallel([
              Animated.spring(element.scale, {
                toValue: 1.2,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.timing(element.x, {
                toValue: endX,
                duration: duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(element.y, {
                toValue: endY,
                duration: duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(element.rotation, {
                toValue: (i % 2 === 0 ? 1 : -1) * 360,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(fadeDelay),
                Animated.timing(element.opacity, {
                  toValue: 0,
                  duration: 500,
                  easing: Easing.ease,
                  useNativeDriver: true,
                }),
              ]),
            ]).start();
          } else {
            // Shapes: Burst and spin
            Animated.parallel([
              Animated.timing(element.x, {
                toValue: endX,
                duration: duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(element.y, {
                toValue: endY,
                duration: duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(element.rotation, {
                toValue: (i % 2 === 0 ? 1 : -1) * 720,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
              Animated.timing(element.scale, {
                toValue: 0.8,
                duration: duration,
                easing: Easing.ease,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.delay(fadeDelay),
                Animated.timing(element.opacity, {
                  toValue: 0,
                  duration: 500,
                  easing: Easing.ease,
                  useNativeDriver: true,
                }),
              ]),
            ]).start();
          }
        });
      });

      // Clear confetti after animation completes
      setTimeout(() => {
        setConfettiElements([]);
      }, 1800);
    }
  };

  // Parallax animations
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [0, -HEADER_MAX_HEIGHT * 0.3],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT * 0.7, HEADER_MAX_HEIGHT],
    outputRange: [1, 0.9, 0.5],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-150, 0],
    outputRange: [1.3, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-white">
      {/* Fixed Parallax Background Image - PURELY VISUAL NOW */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_MAX_HEIGHT,
          transform: [{ translateY: imageTranslateY }, { scale: imageScale }],
          opacity: imageOpacity,
          zIndex: 0,
        }}
      >
        {displayImage ? (
          <Image
            source={{ uri: displayImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={80} color="#9CA3AF" />
          </View>
        )}

        {/* Keep the badge purely visual here */}
        {savings && (
          <View className="absolute bottom-4 left-4 bg-red-500 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">
              {savings.percentage}% OFF
            </Text>
          </View>
        )}
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{
          // paddingTop: HEADER_MAX_HEIGHT,
          paddingBottom: 40,
        }}
      >
        {/* THIS IS THE NEW INVISIBLE CLICK AREA */}
        <TouchableOpacity
          style={{ height: HEADER_MAX_HEIGHT, width: "100%" }}
          activeOpacity={1} // Keep at 1 so background doesn't flicker on press
          onPress={() => {
            if (displayImage) {
              const index = productImages.indexOf(displayImage);
              if (index !== -1) {
                setSelectedImageIndex(index);
              }
              setIsModalOpen(true);
            }
          }}
        />
        {/* Content Container with White Background */}
        <View
          className="bg-white shadow-lg"
          style={{
            minHeight: "100%",
            zIndex: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
        >
          {/* Image Thumbnails */}
          {productImages.length > 1 && (
            <View className="px-4 pt-4 border-b border-gray-100">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Product Images
              </Text>
              <ScrollView
                ref={imageScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {productImages.map((image: string, index: number) => {
                  const isDisplayImage = image === displayImage;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedImageIndex(index);
                        setManuallySelectedImage(image);
                      }}
                      className={`mr-2 w-16 h-20 rounded-lg overflow-hidden border-2 ${
                        isDisplayImage ? "border-orange-500" : "border-gray-200"
                      }`}
                    >
                      <Image
                        source={{ uri: image }}
                        className="w-16 h-20"
                        resizeMode="contain"
                      />
                      {isDisplayImage && (
                        <View className="absolute top-1 right-1 bg-orange-500 rounded-full p-0.5">
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Product Info */}
          <View className="px-4 py-3">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {product.productName}
            </Text>

            {/* Variant Selection */}
            {availableVariants.length > 1 && (
              <View className="mb-2">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Select Variant
                </Text>
                <ScrollView
                  ref={variantScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {availableVariants.map((variant: any, index: number) => {
                    const isSelected = selectedVariantIndex === index;
                    const discount =
                      variant.mrp > variant.netPrice
                        ? (
                            ((variant.mrp - variant.netPrice) / variant.mrp) *
                            100
                          ).toFixed(0)
                        : 0;

                    return (
                      <TouchableOpacity
                        key={variant.variantId}
                        onPress={() => handleVariantChange(index)}
                        className={`mr-2 flex flex-col items-center px-4 py-3 rounded-lg border-2 ${
                          isSelected
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            isSelected ? "text-orange-600" : "text-gray-900"
                          }`}
                        >
                          {variant.variant} {variant.unit}
                        </Text>
                        <View className="flex flex-row items-center justify-center gap-2">
                          <Text className="text-sm font-bold text-green-600 mt-1">
                            ₹{variant.netPrice}
                          </Text>
                          {variant.mrp > variant.netPrice && (
                            <Text className="text-xs text-gray-500 line-through">
                              ₹{variant.mrp}
                            </Text>
                          )}
                        </View>

                        {Number(discount) > 0 && (
                          <Text className="text-xs text-red-600 font-bold mt-1">
                            {discount}% OFF
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Price Section */}
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <View className="flex-row items-baseline">
                  <Text className="text-2xl font-bold text-gray-900">
                    ₹{selectedVariant?.netPrice}
                  </Text>
                  {selectedVariant?.mrp > selectedVariant?.netPrice && (
                    <Text className="text-base text-gray-500 line-through ml-2">
                      ₹{selectedVariant?.mrp}
                    </Text>
                  )}
                </View>
                {savings && (
                  <Text className="text-sm text-green-600 font-semibold mt-1">
                    You save ₹{savings.amount} ({savings.percentage}% OFF)
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  (Inclusive of all taxes)
                </Text>
              </View>

              {/* Add to Cart Button */}
              <View>
                {quantity === 0 ? (
                  <TouchableOpacity
                    onPress={handleAddToCart}
                    className="bg-orange-500 rounded-full px-6 py-2"
                    activeOpacity={0.8}
                  >
                    <Text className="text-white font-bold">ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center bg-orange-500 rounded-full">
                    <TouchableOpacity
                      onPress={handleDecrement}
                      className="w-8 h-8 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold px-3">
                      {quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={handleIncrement}
                      className="w-8 h-8 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            {quantity > 0 && (
              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold">
                    Continue Shopping
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/cart")}
                  className="flex-1 bg-green-600 rounded-lg py-3 items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold">Go to Cart</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Description */}
            {product.description && (
              <View className="mb-3">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Overview
                </Text>
                <View className="bg-gray-50 rounded-lg overflow-hidden">
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
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                              font-size: 14px;
                              color: #374151;
                              line-height: 1.5;
                              padding: 12px;
                              background-color: #F9FAFB;
                              overflow-x: hidden;
                            }
                            h1 {
                              font-size: 20px;
                              font-weight: bold;
                              color: #111827;
                              margin-bottom: 8px;
                            }
                            h2 {
                              font-size: 18px;
                              font-weight: bold;
                              color: #111827;
                              margin-bottom: 6px;
                            }
                            h3 {
                              font-size: 16px;
                              font-weight: 600;
                              color: #111827;
                              margin-bottom: 6px;
                            }
                            p {
                              margin-bottom: 8px;
                              line-height: 1.5;
                            }
                            ul, ol {
                              margin-bottom: 8px;
                              padding-left: 20px;
                            }
                            li {
                              margin-bottom: 4px;
                              line-height: 1.5;
                            }
                            strong {
                              font-weight: 600;
                              color: #111827;
                            }
                            a {
                              color: #F97316;
                              text-decoration: underline;
                            }
                            img {
                              max-width: 100%;
                              height: auto;
                            }
                          </style>
                        </head>
                        <body>
                          ${product.description}
                        </body>
                      </html>
                    `,
                    }}
                    style={{
                      height: showFullDescription ? 400 : 150,
                      backgroundColor: "transparent",
                    }}
                    scrollEnabled={showFullDescription}
                    showsVerticalScrollIndicator={false}
                    androidLayerType="software"
                  />
                  {product.description.length > 200 && (
                    <TouchableOpacity
                      onPress={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="bg-gray-50 px-3 py-2 border-t border-gray-200"
                    >
                      <Text className="text-orange-500 font-semibold text-sm text-center">
                        {showFullDescription ? "Show Less" : "Read More"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Product Details */}
            {(product.brand || product.productAttributes?.length > 0) && (
              <View className="mb-3">
                <Text className="text-lg font-bold text-gray-900 mb-2">
                  Product Details
                </Text>

                {/* Brand */}
                {product.brand && (
                  <View
                    className={`bg-gray-50 rounded-lg p-3 mb-2 ${
                      product.brand.length > 30 ? "flex-col" : "flex-row"
                    }`}
                  >
                    <Text className="text-sm font-semibold text-gray-900 flex-1">
                      Brand
                    </Text>
                    <Text
                      className={`text-sm text-gray-700 ${
                        product.brand.length > 30 ? "mt-1" : "flex-1"
                      }`}
                    >
                      {product.brand}
                    </Text>
                  </View>
                )}

                {/* Product Attributes */}
                {product.productAttributes?.map((attr: any, index: number) => {
                  const isLongText = attr.value && attr.value.length > 30;
                  return (
                    <View
                      key={index}
                      className={`bg-gray-50 rounded-lg p-3 mb-2 ${
                        isLongText ? "flex-col" : "flex-row"
                      }`}
                    >
                      <Text className="text-sm font-semibold text-gray-900 flex-1">
                        {attr.name}
                      </Text>
                      <Text
                        className={`text-sm text-gray-700 ${
                          isLongText ? "mt-1" : "flex-1"
                        }`}
                      >
                        {attr.value}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Back Button */}
      <View style={{ position: "absolute", top: 48, left: 16, zIndex: 100 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/90 rounded-full p-2 shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Confetti Celebration Animation */}
      {confettiElements.map((element) => (
        <Animated.View
          key={element.id}
          style={{
            position: "absolute",
            zIndex: 250,
            transform: [
              { translateX: element.x },
              { translateY: element.y },
              {
                rotate: element.rotation.interpolate({
                  inputRange: [-720, 720],
                  outputRange: ["-720deg", "720deg"],
                }),
              },
              { scale: element.scale },
            ],
            opacity: element.opacity,
          }}
        >
          {element.type === "icon" ? (
            <View
              style={{
                shadowColor: element.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
                elevation: 10,
              }}
            >
              <Ionicons
                name={element.icon as any}
                size={32}
                color={element.color}
              />
            </View>
          ) : (
            <View
              style={{
                width: element.shape === "circle" ? 14 : 12,
                height: element.shape === "circle" ? 14 : 12,
                backgroundColor: element.color,
                borderRadius: element.shape === "circle" ? 7 : 3,
                shadowColor: element.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 5,
              }}
            />
          )}
        </Animated.View>
      ))}

      {/* Full Screen Image Viewer with Zoom */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            {/* Header */}
            <View
              style={{
                position: "absolute",
                top: 48,
                left: 0,
                right: 0,
                zIndex: 100,
                paddingHorizontal: 16,
              }}
            >
              <View className="flex-row justify-between items-center">
                <View className="bg-black/60 rounded-full px-4 py-2">
                  <Text className="text-white font-semibold">
                    {selectedImageIndex + 1} / {productImages.length}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  className="bg-black/60 rounded-full p-2"
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Gallery with Swipe and Zoom */}
            <ScrollView
              ref={modalScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setSelectedImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {productImages.map((uri: string, index: number) => (
                <View
                  key={index}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                >
                  <ImageZoom
                    uri={uri}
                    minScale={1}
                    maxScale={5}
                    doubleTapScale={3}
                    isDoubleTapEnabled
                    isSingleTapEnabled
                    onSingleTap={() => setIsModalOpen(false)}
                    style={{
                      width: SCREEN_WIDTH,
                      height: SCREEN_HEIGHT,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                position: "absolute",
                bottom: 40,
                left: 0,
                right: 0,
                paddingHorizontal: 16,
              }}
            >
              <View className="bg-black/60 rounded-2xl p-3">
                <Text className="text-white text-center font-semibold">
                  {product.productName}
                </Text>
                <Text className="text-white/70 text-center text-sm mt-1">
                  Pinch to zoom • Swipe to navigate • Tap to close
                </Text>
              </View>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}
