import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Shipping() {
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
          Shipping Policy
        </Text>

        {/* Content */}
        <View className="space-y-6 pb-4">
          {/* Introduction */}
          <View>
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Our Shipping Process
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Thank you for shopping on BigLocal.in! As a marketplace platform,
              we connect you with local sellers ("Vendors") who list their
              products on our site. This policy outlines how shipping is handled
              for your orders.
            </Text>
          </View>

          {/* Shipping Responsibility */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Shipping Responsibility
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              All products sold on BigLocal.in are shipped directly by the{" "}
              <Text className="font-bold">Vendors</Text> or their designated{" "}
              <Text className="font-bold">
                third-party logistics (3PL) partners
              </Text>
              . BigLocal.in does not directly handle warehousing, packaging, or
              shipping. The Vendor you purchase from is solely responsible for
              fulfilling your order in a timely and professional manner.
            </Text>
          </View>

          {/* Order Processing & Dispatch */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-3">
              Order Processing & Dispatch
            </Text>
            <View className="ml-4 mb-2">
              <Text className="text-base text-gray-600 leading-6 mb-2">
                • <Text className="font-bold">Processing Time:</Text> Vendors
                typically process and dispatch orders within{" "}
                <Text className="font-bold">24-48 hours</Text> on business days.
                This timeframe is an estimate and can vary based on the Vendor's
                operational hours and product availability.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Dispatch Notification:</Text> You
                will receive an email and/or SMS notification once your order
                has been dispatched by the Vendor. This notification will
                include tracking information, if available.
              </Text>
            </View>
          </View>

          {/* Delivery Timelines & Costs */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-3">
              Delivery Timelines & Costs
            </Text>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Estimated Delivery Time
            </Text>
            <Text className="text-base text-gray-600 leading-6 mb-3">
              Delivery times are estimates and depend on the Vendor's location,
              your delivery address, and the efficiency of the logistics
              partner. Typical estimates are:
            </Text>
            <Text className="text-base italic text-gray-600 leading-6 mb-4">
              Please note that delays may occur due to unforeseen circumstances
              such as public holidays, extreme weather conditions, or logistical
              disruptions.
            </Text>

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Shipping Costs
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Shipping and handling charges are determined by each Vendor and
              will be clearly displayed during the checkout process before you
              confirm your payment. Fees may vary based on order size, weight,
              and delivery distance. Some Vendors may offer free shipping based
              on a minimum order value.
            </Text>
          </View>

          {/* Order Tracking */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Order Tracking
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              Once your order is shipped, tracking details will be provided by
              the Vendor and made available in the "My Orders" section of your
              BigLocal.in account. Please allow up to 24 hours for the tracking
              information to become active after you receive the dispatch
              notification.
            </Text>
          </View>

          {/* Multiple Vendors & Shipments */}
          <View>
            <Text className="text-base font-bold text-gray-700 mb-2">
              Multiple Vendors & Shipments
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              If your cart contains products from multiple Vendors, your items
              will be shipped in{" "}
              <Text className="font-bold">separate packages</Text> by each
              respective Vendor. You will receive separate dispatch
              notifications and tracking numbers for each part of your order.
            </Text>
          </View>

          {/* Our Role and Limitation of Liability */}
          <View className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
            <Text className="text-base font-bold text-red-800 mb-2">
              Our Role and Limitation of Liability
            </Text>
            <Text className="text-sm text-red-700 leading-6">
              BigLocal.in acts as a facilitator to connect buyers and sellers.
              We are <Text className="font-bold">not liable</Text> for any
              delays in shipping, damage that occurs during transit, or
              non-delivery of items. For any shipping-related issues, your
              primary point of contact is the{" "}
              <Text className="font-bold">Vendor</Text>. However, our customer
              support team is available to help mediate and facilitate
              communication if you face difficulties.
            </Text>
          </View>

          {/* Delivery Issues */}
          <View className="mb-8">
            <Text className="text-base font-bold text-gray-700 mb-3">
              Delivery Issues
            </Text>
            <View className="ml-4 mb-2">
              <Text className="text-base text-gray-600 leading-6 mb-2">
                • <Text className="font-bold">Incorrect Address:</Text> The
                customer is responsible for providing a complete and accurate
                delivery address. BigLocal.in and its Vendors are not
                responsible for delivery failures due to an incorrect or
                incomplete address.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Undeliverable Packages:</Text> If
                a package is returned to the Vendor as undeliverable, the order
                may be canceled. A refund may be issued, potentially deducting
                the shipping charges incurred by the Vendor.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
