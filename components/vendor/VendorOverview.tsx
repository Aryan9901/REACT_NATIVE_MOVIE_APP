import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml from "react-native-render-html";

interface VendorOverviewProps {
  vendor: any;
}

export default function VendorOverview({ vendor }: VendorOverviewProps) {
  const { width } = useWindowDimensions();

  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const formatAddress = () => {
    const addr = vendor?.detailedAddress || vendor?.address;
    if (!addr) return "Address not available";

    const parts = [];
    if (addr.address1) parts.push(addr.address1);
    if (addr.address2) parts.push(addr.address2);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.zipCode) parts.push(addr.zipCode);

    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleOpenMap = () => {
    const addr = vendor?.detailedAddress || vendor?.address;
    if (!addr) return;

    // Use coordinates if available, otherwise use address
    let mapUrl;
    if (addr.latitude && addr.longitude) {
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`;
    } else {
      const addressString = formatAddress();
      const encodedAddress = encodeURIComponent(addressString);
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    }

    if (mapUrl) {
      Linking.openURL(mapUrl);
    }
  };

  const aboutUs = getAttributeValue("aboutUs");

  return (
    <ScrollView className="flex-1 bg-gray-50 px-2">
      {/* About Us Section */}
      {aboutUs && (
        <View className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900 mb-3 px-4 pt-4">
            About Us
          </Text>
          <View className="bg-gray-50 px-4 pb-4">
            <RenderHtml
              contentWidth={width - 32}
              source={{ html: aboutUs }}
              tagsStyles={{
                body: {
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 22,
                },
                h1: {
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 12,
                },
                h2: {
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: 10,
                },
                h3: {
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#111827",
                  marginBottom: 8,
                },
                p: {
                  marginBottom: 12,
                  lineHeight: 22,
                },
                ul: {
                  marginBottom: 12,
                  paddingLeft: 24,
                },
                ol: {
                  marginBottom: 12,
                  paddingLeft: 24,
                },
                li: {
                  marginBottom: 6,
                  lineHeight: 22,
                },
                strong: {
                  fontWeight: "600",
                  color: "#111827",
                },
                a: {
                  color: "#F97316",
                  textDecorationLine: "underline",
                },
                img: {
                  borderRadius: 8,
                  marginVertical: 12,
                },
              }}
            />
          </View>
        </View>
      )}

      {/* Contact Info Section */}
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Contact Info
        </Text>

        {/* Phone */}
        {vendor.contactNo && (
          <TouchableOpacity
            onPress={() => handleCall(vendor.contactNo)}
            className="flex-row items-center mb-4"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
              <Ionicons name="call" size={20} color="#2563EB" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {vendor.contactNo}
              </Text>
              <Text className="text-xs text-gray-500">Give us a call</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Alternate Phone */}
        {vendor.alternateContact && (
          <TouchableOpacity
            onPress={() => handleCall(vendor.alternateContact)}
            className="flex-row items-center mb-4"
          >
            <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center">
              <Ionicons name="call" size={20} color="#10B981" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {vendor.alternateContact}
              </Text>
              <Text className="text-xs text-gray-500">Alternate contact</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Address */}
        <TouchableOpacity
          onPress={handleOpenMap}
          className="flex-row items-center mb-4"
        >
          <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
            <Ionicons name="location" size={20} color="#DC2626" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-medium text-gray-900">
              {formatAddress()}
            </Text>
            <Text className="text-xs text-gray-500">View on map</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Email */}
        {vendor.emailId && (
          <TouchableOpacity
            onPress={() => handleEmail(vendor.emailId)}
            className="flex-row items-center mb-4"
          >
            <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center">
              <Ionicons name="mail" size={20} color="#F59E0B" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-medium text-gray-900">
                {vendor.emailId}
              </Text>
              <Text className="text-xs text-gray-500">
                For enquiry & support
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
