import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Terms() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <Header />
      <ScrollView className="flex-1 px-4 py-6">
        {/* Back Button */}
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

        {/* Title */}
        <Text className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Terms and Conditions
        </Text>

        {/* Content */}
        <View className="space-y-6">
          {/* Welcome Section */}
          <View>
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Welcome to BigLocal.in!
            </Text>
            <Text className="text-base text-gray-600 leading-6 mb-4">
              These Terms of Use ('Terms') govern your access and use of the
              BigLocal.in platform (Platform) and the services offered thereon
              (Services).
            </Text>
          </View>

          {/* About Us */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              About Us
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Revvtch is a Limited Liability Partnership Firm incorporated under
              the Companies Act, 2013, with its registered office at 205,
              Katyayani CGHS, Plot No-8, Sector-6, Dwarka, New Delhi-110075
              (referred to as 'We,' 'biglocal.in,' 'BigLocal' 'Us,' or 'Our' in
              these Terms).
            </Text>
          </View>

          {/* Indemnification */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Indemnification
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              You agree to indemnify BigLocal.in for any claims arising out of
              your use of the Platform.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Changes to the Terms
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              BigLocal.in may change these Terms at any time. We will post any
              changes on the Platform.
            </Text>
          </View>

          {/* Return Policy */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-3">
              Return Policy
            </Text>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              General Guidelines
            </Text>
            <Text className="text-base text-gray-600 leading-6 mb-4">
              At BigLocal.in, we strive to ensure every purchase meets your
              expectations. However, due to the nature of our products and
              vendor policies, items are generally{" "}
              <Text className="font-bold">
                non-returnable, non-replaceable, and non-exchangeable
              </Text>
              . Your satisfaction remains our priority, and we do make
              exceptions under specific, outlined circumstances.
            </Text>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Conditions for Eligibility
            </Text>
            <Text className="text-base text-gray-600 leading-6 mb-2">
              You may be eligible to request a return or replacement if the
              product received falls into one of the following categories:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-600 leading-6 mb-1">
                • <Text className="font-bold">Damaged Goods:</Text> The product
                exhibits physical damage upon delivery.
              </Text>
              <Text className="text-base text-gray-600 leading-6 mb-1">
                • <Text className="font-bold">Defective Items:</Text> The
                product is found to be defective or not functioning as intended.
              </Text>
              <Text className="text-base text-gray-600 leading-6 mb-1">
                • <Text className="font-bold">Expired Products:</Text> The
                product has passed its stated expiry date when delivered to you.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Incorrect Deliveries:</Text> The
                product received is not the item you ordered.
              </Text>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Initiating a Return Request
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-600 leading-6 mb-1">
                1. <Text className="font-bold">Contact Support:</Text> Reach out
                to our customer support team within 48 hours of delivery.
              </Text>
              <Text className="text-base text-gray-600 leading-6 mb-1">
                2. <Text className="font-bold">Provide Details:</Text> Have your
                Order ID ready and provide clear photographic evidence.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                3. <Text className="font-bold">Await Approval:</Text> Our team
                will review your request and communicate the next steps.
              </Text>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Refund Process for Approved Returns
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-base text-gray-600 leading-6 mb-1">
                • <Text className="font-bold">Processing Timeline:</Text>{" "}
                Refunds are typically processed within 7 business days.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Currency:</Text> All refunds are
                processed in Indian Rupees (INR).
              </Text>
            </View>

            <View className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
              <Text className="text-base font-bold text-yellow-800 mb-2">
                Important Note:
              </Text>
              <Text className="text-sm text-yellow-700 leading-6">
                BigLocal.in reserves the right to make final decisions on all
                return and refund requests. Our goal is to provide fair and
                transparent resolutions while adhering to vendor policies.
              </Text>
            </View>
          </View>

          {/* Refund & Cancellation Policy */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-3">
              Refund & Cancellation Policy
            </Text>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Order Cancellations
            </Text>
            <Text className="text-base text-gray-600 leading-6 mb-4">
              The ability to cancel an order is subject to approval by the
              respective BigLocal.in vendor. Below are the terms for different
              cancellation scenarios:
            </Text>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                1. Cancellations Initiated by You
              </Text>
              <Text className="text-base text-gray-600 leading-6 mb-4">
                You may request to cancel an order after it has been placed. If
                the vendor approves the cancellation, any applicable refund will
                be processed within 7 business days.
              </Text>

              <Text className="text-base font-semibold text-gray-700 mb-2">
                2. Cancellations by a BigLocal.in Vendor
              </Text>
              <Text className="text-base text-gray-600 leading-6 mb-4">
                Our vendors reserve the right to cancel an order under certain
                circumstances. If your order is cancelled by a vendor, any
                applicable refund will be processed within 7 business days.
              </Text>

              <Text className="text-base font-semibold text-gray-700 mb-2">
                3. Cancellations Due to Errors
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                In the event of an error in product information or pricing, we
                reserve the right to cancel the order. A refund will be
                processed within 7 business days.
              </Text>
            </View>

            <View className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
              <Text className="text-base font-bold text-blue-800 mb-2">
                Important Terms
              </Text>
              <View className="ml-2">
                <Text className="text-sm text-blue-700 leading-6 mb-1">
                  • <Text className="font-bold">Currency:</Text> All refunds
                  will be processed in Indian Rupees (INR).
                </Text>
                <Text className="text-sm text-blue-700 leading-6 mb-1">
                  • <Text className="font-bold">Promotional Offers:</Text> If an
                  order is cancelled, any promotional offers may be voided.
                </Text>
                <Text className="text-sm text-blue-700 leading-6">
                  • <Text className="font-bold">Final Discretion:</Text>{" "}
                  BigLocal.in reserves the right to make final decisions.
                </Text>
              </View>
            </View>
          </View>

          {/* Governing Law */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Governing Law
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              These Terms are governed by and construed in accordance with the
              laws of India.
            </Text>
          </View>

          {/* Dispute Resolution */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Dispute Resolution
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Any disputes arising out of or relating to these Terms will be
              resolved by the courts of Delhi, India.
            </Text>
          </View>

          {/* Entire Agreement */}
          <View className="mb-8">
            <Text className="text-base font-bold text-gray-700 mb-2">
              Entire Agreement
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              These Terms constitute the entire agreement between you and
              BigLocal.in regarding your use of the Platform.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
