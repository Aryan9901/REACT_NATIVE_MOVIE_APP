import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const FAQSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View className="mb-6">
    <Text className="text-lg font-bold text-gray-800 mb-3">{title}</Text>
    {children}
  </View>
);

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <View className="mb-4">
    <Text className="text-base font-semibold text-gray-700 mb-2">
      {question}
    </Text>
    <Text className="text-sm text-gray-600 leading-6">{answer}</Text>
  </View>
);

export default function FAQ() {
  const router = useRouter();

  const handleContactUs = () => {
    router.push("/(tabs)/contact" as any);
  };

  const handleBackPress = () => {
    router.replace("/(tabs)/profile");
    return true; // Prevent default back behavior
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/profile")}
          className="flex-row items-center mb-4"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Back
          </Text>
        </TouchableOpacity>

        <Text className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          Frequently Asked Questions
        </Text>
        <Text className="text-sm text-gray-600 mb-8 text-center">
          Find answers to the most commonly asked questions about our platform,
          services, and policies.
        </Text>

        {/* General Questions */}
        <FAQSection title="General Questions">
          <FAQItem
            question="What is BigLocal.in?"
            answer="BigLocal.in is a local marketplace platform that connects you with nearby vendors and sellers. We help you discover and purchase products from local businesses in your area, supporting your community while enjoying convenient delivery services."
          />
          <FAQItem
            question="How do I create an account?"
            answer='Creating an account is simple. Click on the "Sign In" button, enter your mobile number, verify it with the OTP sent to your phone, and complete your profile information. You can also browse as a guest without creating an account.'
          />
          <FAQItem
            question="Is BigLocal.in available in my area?"
            answer="BigLocal.in is expanding across India. Enter your delivery address during checkout to see if we serve your location. We're constantly adding new areas and vendors to our platform."
          />
        </FAQSection>

        {/* Orders & Delivery */}
        <FAQSection title="Orders & Delivery">
          <FAQItem
            question="How do I place an order?"
            answer="Browse products from local vendors, add items to your cart, proceed to checkout, enter your delivery address, select a payment method, and confirm your order. You'll receive order updates via SMS and in-app notifications."
          />
          <FAQItem
            question="What are the delivery charges?"
            answer="Delivery charges vary based on your location, order value, and the vendor's policies. The exact delivery fee will be displayed during checkout before you confirm your order."
          />
          <FAQItem
            question="How long does delivery take?"
            answer='Delivery times depend on the vendor and your location. Most orders are delivered within the timeframe specified by the vendor at the time of order placement. You can track your order status in the "My Orders" section.'
          />
          <FAQItem
            question="Can I track my order?"
            answer="Yes, you can track your order in real-time through the My Orders section in your profile. You'll receive updates at each stage of the delivery process."
          />
        </FAQSection>

        {/* Payments */}
        <FAQSection title="Payments">
          <FAQItem
            question="What payment methods are accepted?"
            answer="We accept multiple payment methods including UPI, credit/debit cards, net banking, and cash on delivery (where available). Payment options may vary based on vendor preferences."
          />
          <FAQItem
            question="Is it safe to pay online?"
            answer="Yes, all online transactions on BigLocal.in are secured with industry-standard encryption. We use trusted third-party payment gateways to ensure your payment information is protected."
          />
          <FAQItem
            question="Can I pay cash on delivery?"
            answer="Cash on delivery is available for select orders based on vendor policies and your location. The option will be displayed during checkout if available for your order."
          />
        </FAQSection>

        {/* Returns & Refunds */}
        <FAQSection title="Returns & Refunds">
          <FAQItem
            question="What is your return policy?"
            answer="Products are generally non-returnable, non-replaceable, and non-exchangeable. However, we accept returns for damaged, defective, expired, or incorrectly delivered products. Please refer to our Return Policy page for detailed information."
          />
          <FAQItem
            question="How do I request a return?"
            answer="Contact our customer support within 48 hours of delivery (or as specified on the product page) with your Order ID and clear photographic evidence of the issue. Our team will review your request and guide you through the process."
          />
          <FAQItem
            question="How long does it take to get a refund?"
            answer="Approved refunds are processed within 7 business days from the date of return approval. The refund will be credited to your original payment method or as promotional codes, depending on the payment method used."
          />
          <FAQItem
            question="Can I cancel my order?"
            answer="You can request to cancel an order, but cancellation is subject to vendor approval. If approved, refunds will be processed according to our Refund & Cancellation Policy."
          />
        </FAQSection>

        {/* Account & Profile */}
        <FAQSection title="Account & Profile">
          <FAQItem
            question="How do I update my profile information?"
            answer='Go to your profile, click on "My Profile" or "Edit Profile," update your information, and save the changes. You can update your name, email, and other personal details.'
          />
          <FAQItem
            question="How do I manage my delivery addresses?"
            answer='Navigate to "Manage Addresses" in your profile to add, edit, or delete delivery addresses. You can save multiple addresses for convenient checkout.'
          />
          <FAQItem
            question="How do I change my mobile number?"
            answer="Currently, mobile numbers are linked to your account for security purposes. Please contact our customer support team to update your mobile number."
          />
        </FAQSection>

        {/* Vendors & Products */}
        <FAQSection title="Vendors & Products">
          <FAQItem
            question="How do I become a seller on BigLocal.in?"
            answer="If you're a local business owner interested in selling on BigLocal.in, visit our Join us as a Seller page or contact us through the provided link. Our team will guide you through the onboarding process."
          />
          <FAQItem
            question="How are products priced?"
            answer="Product prices are set by individual vendors. We display the MRP (Maximum Retail Price) and any applicable discounts or savings. Prices may vary between vendors."
          />
          <FAQItem
            question="Are products genuine?"
            answer="We work with verified local vendors and sellers. While we strive to ensure product authenticity, we recommend checking product details and vendor ratings before making a purchase."
          />
        </FAQSection>

        {/* Technical Support */}
        <FAQSection title="Technical Support">
          <FAQItem
            question="The app is not working properly. What should I do?"
            answer="Try clearing your app cache, ensure you have a stable internet connection, and update to the latest version of the app. If the issue persists, contact our customer support team."
          />
          <FAQItem
            question="I didn't receive my OTP. What should I do?"
            answer="Ensure you entered the correct mobile number and have network coverage. Wait a few minutes and try requesting the OTP again. If you still don't receive it, contact customer support."
          />
        </FAQSection>

        {/* Privacy & Security */}
        <FAQSection title="Privacy & Security">
          <FAQItem
            question="How is my personal information protected?"
            answer="We take data security seriously and implement industry-standard measures to protect your personal information. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data."
          />
          <FAQItem
            question="Do you share my information with third parties?"
            answer="We only share your information with trusted service providers necessary to deliver our services (such as payment processors and delivery partners). We do not sell your personal information."
          />
        </FAQSection>

        {/* Contact & Support */}
        <FAQSection title="Contact & Support">
          <FAQItem
            question="How do I contact customer support?"
            answer='You can reach our customer support team through email at yogesh@revvtch.com, or visit the "Contact Us" page in your profile for more options.'
          />
        </FAQSection>

        {/* Still Have Questions Card */}
        <View className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
          <Text className="text-base font-bold text-blue-800 mb-2">
            Still Have Questions?
          </Text>
          <Text className="text-sm text-blue-700 mb-4">
            If you couldn't find the answer you were looking for, please don't
            hesitate to contact our customer support team. We're here to help!
          </Text>
          <TouchableOpacity
            onPress={handleContactUs}
            className="bg-blue-600 px-4 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Text className="text-white font-semibold mr-2">Contact Us</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
