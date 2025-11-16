import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

interface VendorBusinessInfoProps {
  vendor: any;
}

export default function VendorBusinessInfo({
  vendor,
}: VendorBusinessInfoProps) {
  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const parseJSON = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  // Business Highlights
  const deliveryCharges = parseFloat(getAttributeValue("deliveryCharges")) || 0;
  const minimumOrder = parseFloat(getAttributeValue("minimumOrder")) || 0;
  const establishedYear = getAttributeValue("establishedYear");
  const deliveryType = getAttributeValue("productDeliveryType");
  const certifications = getAttributeValue("certifications");

  const highlights = [];

  // Delivery Info
  if (deliveryCharges > 0 && minimumOrder > 0) {
    highlights.push({
      icon: "checkmark-circle",
      title: `Free Delivery Over ₹${minimumOrder}`,
      description: `₹${deliveryCharges} fee for smaller orders`,
      color: "#10B981",
    });
  } else if (deliveryCharges === 0 && minimumOrder > 0) {
    highlights.push({
      icon: "checkmark-circle",
      title: "Free Delivery",
      description: `Minimum order: ₹${minimumOrder}`,
      color: "#10B981",
    });
  } else if (deliveryCharges > 0) {
    highlights.push({
      icon: "car",
      title: `Flat ₹${deliveryCharges} Delivery Fee`,
      description: "Convenience delivered to you",
      color: "#F59E0B",
    });
  }

  // Years in Business
  if (establishedYear) {
    const currentYear = new Date().getFullYear();
    const yearsInBusiness = currentYear - parseInt(establishedYear);
    if (yearsInBusiness > 0) {
      highlights.push({
        icon: "calendar",
        title: `${yearsInBusiness}+ Years of Experience`,
        description: `Established in ${establishedYear}`,
        color: "#3B82F6",
      });
    } else {
      highlights.push({
        icon: "sparkles",
        title: "Newly Established",
        description: `Serving you since ${establishedYear}`,
        color: "#8B5CF6",
      });
    }
  }

  // Delivery Type
  if (deliveryType) {
    let title = deliveryType;
    if (deliveryType.toLowerCase() === "both") {
      title = "Home Delivery & Self Pickup";
    }
    highlights.push({
      icon: "bag-handle",
      title,
      description: "Choose what suits you best",
      color: "#EC4899",
    });
  }

  // Certifications
  if (certifications) {
    const certName = certifications.split(";")[0];
    if (certName) {
      highlights.push({
        icon: "shield-checkmark",
        title: `${certName} Certified`,
        description: "Quality and safety you can trust",
        color: "#059669",
      });
    }
  }

  // Legal Details
  const legalDetails = [];
  const gstNo = getAttributeValue("gstNo");
  const panNo = getAttributeValue("panNo");
  const udyamNo = getAttributeValue("udyamNo");
  const isFranchise =
    getAttributeValue("isFranchise")?.toLowerCase() === "true";
  const franchiseName = getAttributeValue("franchiseName");

  if (gstNo) {
    legalDetails.push({
      icon: "document-text",
      label: "GST Number",
      value: gstNo,
    });
  }
  if (panNo) {
    legalDetails.push({ icon: "card", label: "PAN Number", value: panNo });
  }
  if (udyamNo) {
    legalDetails.push({
      icon: "briefcase",
      label: "Udyam Registration",
      value: udyamNo,
    });
  }
  if (isFranchise) {
    legalDetails.push({
      icon: "business",
      label: "Franchise",
      value: franchiseName || "Part of a trusted network",
    });
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 px-1 py-4">
      {/* Highlights Section */}
      {highlights.length > 0 && (
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Why Shop With Us?
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {highlights.map((item, index) => (
              <View key={index} className="w-[48%]">
                <View className="bg-white rounded-lg px-3 items-center justify-center py-4 shadow-sm">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <Text className="text-xs text-center font-bold text-gray-800 mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-center text-gray-600">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Legal Details Section */}
      {legalDetails.length > 0 && (
        <View>
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Business Details
          </Text>
          <View className="bg-white rounded-lg shadow-sm overflow-hidden">
            {legalDetails.map((item, index) => (
              <View
                key={index}
                className={`flex-row items-start px-4 py-4 ${
                  index < legalDetails.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={20} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900 mb-1">
                    {item.label}
                  </Text>
                  <Text className="text-xs text-gray-600">{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {highlights.length === 0 && legalDetails.length === 0 && (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons
            name="information-circle-outline"
            size={64}
            color="#D1D5DB"
          />
          <Text className="text-gray-500 mt-4 text-center">
            No business information available
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
