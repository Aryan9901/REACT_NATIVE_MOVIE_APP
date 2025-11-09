import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const ReturnPolicy = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <Header />

      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-4"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Back
              </Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-center text-gray-900">
              Our Return Policy
            </Text>
            <View className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
          </View>

          <View className="mb-2">
            <Text className="text-lg font-semibold text-blue-600 mb-1">
              General Guidelines
            </Text>
            <Text className="text-base text-gray-700 leading-6">
              At BigLocal.in, we strive to ensure every purchase meets your
              expectations. However, due to the nature of our products and
              vendor policies, items are generally{" "}
              <Text className="font-bold">
                non-returnable, non-replaceable, and non-exchangeable
              </Text>
              . Your satisfaction remains our priority, and we do make
              exceptions under specific, outlined circumstances.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-lg font-semibold text-blue-600 mb-1">
              Conditions for Eligibility
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-1">
              You may be eligible to request a return or replacement if the
              product received falls into one of the following categories:
            </Text>

            <View className="ml-4">
              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Damaged Goods:</Text> The product
                  exhibits physical damage upon delivery.
                </Text>
              </View>

              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Defective Items:</Text> The
                  product is found to be defective or not functioning as
                  intended.
                </Text>
              </View>

              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Expired Products:</Text> The
                  product has passed its stated expiry date when delivered to
                  you.
                </Text>
              </View>

              <View className="flex-row mb-2">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Incorrect Deliveries:</Text> The
                  product received is not the item you ordered.
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-600 italic">
              Please refer to the individual product page for any specific
              return policies set forth by the vendor.
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-lg font-semibold text-blue-600 mb-1">
              Initiating a Return Request
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-1">
              If your item qualifies for a return based on the above conditions,
              please follow these steps:
            </Text>

            <View className="ml-4">
              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2 font-bold">1.</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Contact Support:</Text> Reach out
                  to our customer support team within the specified timeframe
                  (usually within 48 hours of delivery, or as mentioned on the
                  product page).
                </Text>
              </View>

              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2 font-bold">2.</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Provide Details:</Text> Have your
                  Order ID ready and provide clear photographic or video
                  evidence of the product's condition or discrepancy.
                </Text>
              </View>

              <View className="flex-row">
                <Text className="text-gray-700 mr-2 font-bold">3.</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Await Approval:</Text> Our team,
                  in conjunction with the vendor, will review your request and
                  communicate the next steps.
                </Text>
              </View>
            </View>
          </View>

          <View className="">
            <Text className="text-lg font-semibold text-blue-600 mb-1">
              Refund Process for Approved Returns
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-2">
              Upon approval of your return request by the vendor, we will
              proceed with the refund according to the following guidelines:
            </Text>

            <View className="ml-4">
              <View className="flex-row mb-1">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Processing Timeline:</Text>{" "}
                  Refunds are typically processed within{" "}
                  <Text className="font-bold">7 business days</Text> from the
                  date of the return approval. This period may vary based on
                  individual vendor terms.
                </Text>
              </View>

              <View className="flex-row ">
                <Text className="text-gray-700 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-700 leading-6">
                  <Text className="font-bold">Currency:</Text> All refunds are
                  processed and issued in{" "}
                  <Text className="font-bold">Indian Rupees (INR)</Text>.
                </Text>
              </View>
            </View>
          </View>

          <View className="px-4 py-3 rounded-md mb-1">
            <Text className="text-lg font-semibold text-red-600">
              Important Note:
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              BigLocal.in reserves the right to make final decisions on all
              return and refund requests. Our goal is to provide fair and
              transparent resolutions while adhering to vendor policies.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReturnPolicy;
