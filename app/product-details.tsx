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
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 400;

export default function ProductDetailsPage() {
  const router = useRouter();
  const { addToCart, updateCartQuantity, removeFromCart, cart } =
    useStoreStore();

  const [product, setProduct] = useState<any>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const cartItem = cart.find(
    (item) =>
      item.productId === product.productId &&
      item.id === selectedVariant?.variantId
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
      id: selectedVariant.variantId,
      productId: product.productId,
      name: product.productName,
      price: selectedVariant.netPrice,
      quantity: 1,
      image: productImages[0] || null,
    });
  };

  const handleIncrement = () => {
    if (!selectedVariant) return;
    addToCart({
      id: selectedVariant.variantId,
      productId: product.productId,
      name: product.productName,
      price: selectedVariant.netPrice,
      quantity: 1,
      image: productImages[0] || null,
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
      {/* Fixed Parallax Background Image */}
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
        {productImages.length > 0 ? (
          <Image
            source={{ uri: productImages[selectedImageIndex] }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={80} color="#9CA3AF" />
          </View>
        )}
        {savings && (
          <View className="absolute bottom-4 left-4 bg-red-500 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">
              {savings.percentage}% OFF
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Invisible Touch Layer for Image */}
      <Pressable
        onPress={() => {
          if (productImages.length > 0) {
            setIsModalOpen(true);
          }
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_MAX_HEIGHT,
          zIndex: 5,
        }}
      />

      <Animated.ScrollView
        className="flex-1"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT,
          paddingBottom: 40,
        }}
      >
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
            <ScrollView
              ref={imageScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 pt-4 border-b border-gray-100"
            >
              {productImages.map((image: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`mr-2 w-16 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-orange-500"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    source={{ uri: image }}
                    className="w-16 h-20"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
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
