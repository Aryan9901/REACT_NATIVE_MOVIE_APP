import { useStoreStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  const { addToCart, cart } = useStoreStore();
  const [isAdding, setIsAdding] = useState(false);

  const variant = product.productVariants?.[0];
  const imageUrl = product.productImageUrls?.[0] || null;
  const cartItem = cart.find((item) => item.productId === product.productId);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!variant?.available) return;

    setIsAdding(true);
    try {
      addToCart({
        id: product.productId,
        productId: product.productId,
        name: product.productName,
        price: variant.netPrice,
        quantity: 1,
        image: imageUrl,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async () => {
    setIsAdding(true);
    try {
      await addToCart({
        id: product.productId,
        productId: product.productId,
        name: product.productName,
        price: variant.netPrice,
        quantity: 1,
        image: imageUrl,
      });
    } catch (error) {
      console.error("Error incrementing:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDecrement = async () => {
    if (quantityInCart <= 1) {
      useStoreStore.getState().removeFromCart(product.productId);
    } else {
      useStoreStore
        .getState()
        .updateCartQuantity(product.productId, quantityInCart - 1);
    }
  };

  return (
    <View className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Product Image */}
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-32"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-32 bg-gray-100 items-center justify-center">
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          </View>
        )}
        {!variant?.available && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <Text className="text-white font-bold">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View className="p-3">
        <Text
          className="text-sm font-semibold line-clamp-1 text-gray-900 mb-1"
          numberOfLines={2}
        >
          {product.productName}
        </Text>

        {/* Variant Info */}
        {variant && (
          <View className="mb-2">
            <Text className="text-xs text-gray-600">
              {variant.variant} {variant.unit}
            </Text>
          </View>
        )}

        {/* Price */}
        {variant && (
          <View className="flex-row items-center mb-2">
            <Text className="text-base font-bold text-gray-900">
              ₹{variant.netPrice}
            </Text>
            {variant.mrp > variant.netPrice && (
              <>
                <Text className="text-xs text-gray-400 line-through ml-2">
                  ₹{variant.mrp}
                </Text>
                <Text className="text-xs text-green-600 ml-2">
                  {Math.round(
                    ((variant.mrp - variant.netPrice) / variant.mrp) * 100
                  )}
                  % off
                </Text>
              </>
            )}
          </View>
        )}

        {/* Add to Cart Button */}
        {variant?.available && (
          <>
            {quantityInCart === 0 ? (
              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={isAdding}
                className="bg-orange-500 rounded-lg py-2 items-center justify-center"
                activeOpacity={0.8}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-sm font-bold">
                    Add to Cart
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center justify-between bg-orange-500 rounded-lg py-1 px-2">
                <TouchableOpacity
                  onPress={handleDecrement}
                  className="w-8 h-8 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={20} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-bold">{quantityInCart}</Text>
                <TouchableOpacity
                  onPress={handleIncrement}
                  disabled={isAdding}
                  className="w-8 h-8 items-center justify-center"
                  activeOpacity={0.7}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="add" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}
