import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Linking,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface VendorProfileHeaderProps {
  vendor: any;
}

const IconMap: any = {
  youtube: { icon: "logo-youtube", color: "#DC2626", bgColor: "#FEE2E2" },
  facebook: { icon: "logo-facebook", color: "#2563EB", bgColor: "#DBEAFE" },
  instagram: { icon: "logo-instagram", color: "#DB2777", bgColor: "#FCE7F3" },
  Twitter: { icon: "logo-twitter", color: "#000000", bgColor: "#E5E7EB" },
  website: { icon: "globe-outline", color: "#2563EB", bgColor: "#DBEAFE" },
};

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

  const getSocialMediaLinks = () => {
    const labels = ["facebook", "youtube", "instagram", "Twitter", "website"];
    return (
      vendor?.attributeValues?.filter(
        (attr: any) => labels.includes(attr?.name) && attr?.value
      ) || []
    );
  };

  const handleShare = async () => {
    try {
      const inviteCode = vendor?.contactNo?.replace("+91", "") || "";
      const shopName = vendor.shopName || vendor.name;
      const message = `${shopName} on Biglocal\n\nDiscover ${shopName}'s products and services now on Biglocal.in! We are your local seller, online and ready to serve you. Support neighborhood businesses and Go Local—it makes a difference!\n\nTap to explore & order: https://biglocal.in?invite=${inviteCode}`;

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

  const handleSocialLink = (url: string) => {
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    Linking.openURL(url);
  };

  const isShowcaseOnly =
    getAttributeValue("isShowcaseOnly")?.toLowerCase() === "true";

  const isEventVendor =
    getAttributeValue("isEventVendor")?.toLowerCase() === "true";

  const socialMedia = getSocialMediaLinks();

  return (
    <View className="bg-white px-4 py-4">
      <View className="flex-row items-start">
        {/* Profile Image */}
        <Image
          source={{
            uri: vendor.profileImage || "https://via.placeholder.com/100",
          }}
          className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
        />

        {/* Vendor Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-bold text-gray-900 flex-1">
                  {vendor.shopName}
                </Text>
                {/* Share Button */}
                <TouchableOpacity
                  onPress={handleShare}
                  className="p-2 bg-green-50 rounded-full border border-green-200"
                >
                  <Ionicons name="share-social" size={18} color="#16A34A" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-gray-600 mt-1">
                {getAttributeValue("tagline") || vendor.name}
              </Text>

              {/* Social Media Icons */}
              {socialMedia.length > 0 && (
                <View className="flex-row items-center gap-2 mt-2">
                  {socialMedia.map((link: any) => {
                    const iconData = IconMap[link.name];
                    if (!iconData) return null;

                    return (
                      <TouchableOpacity
                        key={link.name}
                        onPress={() => handleSocialLink(link.value)}
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: iconData.bgColor }}
                      >
                        <Ionicons
                          name={iconData.icon as any}
                          size={16}
                          color={iconData.color}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Shop Now Button */}
          {!isShowcaseOnly && (
            <TouchableOpacity
              onPress={handleShopNow}
              className="mt-3 bg-orange-600 py-2 px-4 rounded-lg self-start"
            >
              <Text className="text-white font-semibold text-sm">
                {isEventVendor ? "Book Tickets" : "Shop Now"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
