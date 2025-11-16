import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";

interface VendorProfileHeaderProps {
  vendor: any;
}

export default function VendorProfileHeader({
  vendor,
}: VendorProfileHeaderProps) {
  const router = useRouter();

  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const handleShare = async () => {
    try {
      const shopName = vendor.shopName || vendor.name;
      const message = `Check out ${shopName} on BigLocal!\n\nDiscover amazing products and services from your local seller.`;

      await Share.share({
        message,
        title: shopName,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleShopNow = () => {
    router.push("/store");
  };

  const isShowcaseOnly =
    getAttributeValue("isShowcaseOnly")?.toLowerCase() === "true";

  return (
    <View className="bg-white px-4 py-4">
      <View className="flex-row items-start">
        {/* Profile Image */}
        <Image
          source={{
            uri: vendor.profileImage || "https://via.placeholder.com/100",
          }}
          className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
        />

        {/* Vendor Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {vendor.shopName}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {getAttributeValue("tagline") || vendor.name}
              </Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              onPress={handleShare}
              className="ml-2 p-2 bg-gray-100 rounded-full"
            >
              <Ionicons name="share-social" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Shop Now Button */}
          {!isShowcaseOnly && (
            <TouchableOpacity
              onPress={handleShopNow}
              className="mt-3 bg-orange-600 py-2 px-4 rounded-lg self-start"
            >
              <Text className="text-white font-semibold text-sm">Shop Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
