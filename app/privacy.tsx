import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Privacy() {
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
          Privacy Policy
        </Text>

        {/* Content */}
        <View className="space-y-6 pb-4">
          {/* Introduction */}
          <View className="mb-2">
            <Text className="text-lg font-bold text-gray-800">
              Your Privacy at BigLocal.in
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              BigLocal.in respects your privacy and is committed to protecting
              your personal information. This Privacy Policy explains how we
              collect, use, disclose, and protect your information when you use
              our platform and services.
            </Text>
          </View>

          {/* Information We Collect */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Information We Collect
            </Text>
            <Text className="text-base text-gray-600 leading-6 ">
              We collect information you provide directly, such as your name,
              address, phone number, email address, and payment information when
              you create an account, place an order, or contact us.
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We also collect information automatically when you use our
              platform, such as your IP address, device type, browsing activity,
              and purchase history.
            </Text>
          </View>

          {/* How We Use Your Information */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              How We Use Your Information
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We use your information to provide you with the services you
              request, process your orders, deliver products, communicate with
              you about your orders, and personalize your experience on our
              platform.
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We may also use your information for marketing purposes, such as
              sending you promotional emails or notifications. You can opt out
              of marketing communications at any time.
            </Text>
          </View>

          {/* Information Sharing */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Information Sharing
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We may share your information with third-party service providers
              who help us operate our platform and deliver our services. These
              service providers are contractually obligated to protect your
              information.
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We may also disclose your information if required by law or to
              protect our rights or the safety of others.
            </Text>
          </View>

          {/* Data Security */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Data Security
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We take reasonable steps to protect your information from
              unauthorized access, disclosure, alteration, or destruction.
              However, no internet transmission is completely secure.
            </Text>
          </View>

          {/* Call Recording */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Call Recording
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We may record calls between you and our customer service
              representatives for training and quality purposes. You will be
              notified if a call is being recorded.
            </Text>
          </View>

          {/* Your Choices */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Your Choices
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              You can access and update your personal information in your
              account settings. You can also opt out of marketing communications
              at any time.
            </Text>
          </View>

          {/* Taxes on Your Order */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Taxes on Your Order
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              BigLocal.in will issue relevant tax documents, such as invoices,
              as required by law. These documents will be available on your
              order summary page after delivery.
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Goods:</Text> For goods supplied
                by third-party sellers listed on the BigLocal.in Platform, you
                will receive a Tax Invoice cum Bill of Supply issued on behalf
                of the seller, as applicable.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Services:</Text> For services
                provided by BigLocal.in or third-party service providers, you
                will receive a Tax Invoice.
              </Text>
            </View>
            <Text className="text-base text-gray-600 leading-6">
              To avail GST benefits, you must provide a valid GST number during
              the order placement process. Your eligibility for GST benefits is
              subject to the GST terms and conditions, which are incorporated
              into these Terms.
            </Text>
          </View>

          {/* Order Cancellation */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Order Cancellation
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              You may request to cancel an order, but cancellation is subject to
              BigLocal.in's approval.
            </Text>
            <View className="ml-4 mb-2">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Order Cancellations by You:</Text>{" "}
                Cancellation requests may be approved by BigLocal.in. If
                approved, a refund, if applicable, will be issued in the form of
                promotional codes redeemable on future orders.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                •{" "}
                <Text className="font-bold">
                  Order Cancellations by BigLocal.in:
                </Text>{" "}
                BigLocal.in may cancel orders due to fraud, violations of these
                Terms, product unavailability, or unforeseen circumstances.
                Refunds, if applicable, will be processed within 72 hours.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                •{" "}
                <Text className="font-bold">
                  Order Cancellations Due to Errors:
                </Text>{" "}
                If an error in product information or pricing is discovered,
                BigLocal.in reserves the right to cancel the order and issue a
                refund in the form of promotional codes.
              </Text>
            </View>
          </View>

          {/* Returns & Refunds */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Returns & Refunds
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">General:</Text> Products are
                generally non-returnable/non-replaceable/non-exchangeable.
                Exceptions may apply for damaged, defective, expired, or
                incorrectly delivered products, or as specified in the product's
                return policy.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Refund Processing:</Text> Refunds
                for eligible returns and cancellations will be processed within
                7 business days.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Refund Methods:</Text> Refunds for
                online payments may be issued as credits, cashbacks, or
                promotional codes. Refunds for cash on delivery orders will be
                issued as promotional codes.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Currency:</Text> All refunds will
                be issued in Indian Rupees.
              </Text>
            </View>
          </View>

          {/* Promotional Terms */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Promotional Terms
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Eligibility:</Text> Offers are
                subject to specific eligibility criteria and may have
                limitations.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Duration:</Text> Offers may be
                modified or discontinued at any time.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Returns and Refunds:</Text> Offers
                may be void if the order is returned, refunded, or cancelled.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Third-Party Involvement:</Text>{" "}
                BigLocal.in is not responsible for services provided by third
                parties in connection with offers.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Data Sharing:</Text> By
                participating in an offer, you consent to the sharing of your
                information with third parties.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Disclaimer:</Text> BigLocal.in
                reserves the right to modify or cancel offers at any time.
              </Text>
            </View>
          </View>

          {/* Payments */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">Payments</Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Payment Methods:</Text> Payments
                for orders must be made in Indian Rupees. Accepted payment
                methods include credit card, debit card, net banking, UPI, cash
                on delivery, and other methods as may be available on the
                Platform.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                •{" "}
                <Text className="font-bold">
                  Third-Party Payment Processors:
                </Text>{" "}
                BigLocal.in may use third-party payment processors to facilitate
                payments. You agree to be bound by the terms and conditions of
                such third-party processors.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Payment Responsibility:</Text> You
                are solely responsible for ensuring the accuracy and validity of
                your payment information.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Payment Fees:</Text> You may be
                charged additional fees by your bank or payment issuer for
                certain payment methods.
              </Text>
            </View>
          </View>

          {/* Order History */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700 ">
              Order History
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Deleting Orders:</Text> Deleting
                an order from your account history will make it inaccessible to
                you. However, it may still be accessible to others who have
                received order information from you.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Irreversibility:</Text> Deleted
                orders cannot be retrieved or used for support requests.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Data Retention:</Text> Deleted
                orders may still be retained by BigLocal.in for record-keeping
                purposes.
              </Text>
            </View>
          </View>

          {/* Grievance Redressal */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Grievance Redressal
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Initial Contact:</Text> For
                order-related issues, please contact us through the in-app chat
                support for the quickest resolution.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • <Text className="font-bold">Grievance Officer:</Text> For
                formal complaints, please contact our Grievance Officer as per
                the details published on the Platform.
              </Text>
            </View>
          </View>

          {/* Indemnification */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Indemnification
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              You agree to indemnify BigLocal.in against any claims arising from
              your use of the Platform, including violations of these Terms or
              infringement of third-party rights.
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Limitation of Liability
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • BigLocal.in's liability is limited to the refund of the order
                amount in case of court-ordered liability.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • BigLocal.in is not liable for any indirect, special, or
                consequential damages.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • You must file any legal action within one year of the alleged
                harm.
              </Text>
            </View>
          </View>

          {/* Termination */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Termination
            </Text>
            <View className="ml-4">
              <Text className="text-base text-gray-600 leading-6">
                • BigLocal.in may terminate your account or restrict your access
                to the Platform at any time for any reason, including violations
                of these Terms.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • You may delete your account at any time.
              </Text>
              <Text className="text-base text-gray-600 leading-6">
                • Upon termination, your obligation to pay for existing orders
                remains.
              </Text>
            </View>
          </View>

          {/* Changes to Privacy Policy */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Changes to this Privacy Policy
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              We may update this Privacy Policy from time to time. We will post
              any changes on our platform.
            </Text>
          </View>

          {/* Governing Law & Jurisdiction */}
          <View className="mb-2">
            <Text className="text-base font-bold text-gray-700">
              Governing Law & Jurisdiction
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              These Terms are governed by and construed in accordance with the
              laws of India. Courts in New Delhi shall have exclusive
              jurisdiction over any disputes arising from these Terms.
            </Text>
          </View>

          {/* Contact Us */}
          <View className="mb-8">
            <Text className="text-base font-bold text-gray-700">
              Contact Us
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              If you have any questions about this Privacy Policy, please
              contact us at yogesh@revvtch.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
