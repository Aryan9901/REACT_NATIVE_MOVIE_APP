import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";

interface VendorEventDetailsProps {
  vendor: any;
}

export default function VendorEventDetails({
  vendor,
}: VendorEventDetailsProps) {
  const { width } = useWindowDimensions();

  const getAttributeValue = (name: string) => {
    const attr = vendor?.attributeValues?.find(
      (attr: any) => attr?.name === name
    );
    return attr?.value || "";
  };

  const eventDetails = getAttributeValue("eventDetails");

  if (!eventDetails) {
    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <Text className="text-gray-500 text-center">
          No event details available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 px-2">
      <View className="bg-white rounded-lg overflow-hidden mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-900 mb-3 px-4 pt-4">
          About The Event
        </Text>
        <View className="bg-gray-50 px-4 pb-4">
          <RenderHtml
            contentWidth={width - 32}
            source={{ html: eventDetails }}
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
    </ScrollView>
  );
}
