import {
  API_URL,
  ORDER_ATTRIBUTE_KEYS,
  PAYMENT_MODE,
  RAZORPAY_CONFIG,
  STORAGE_KEYS,
  USER_ROLES,
} from "@/lib/constants";
import { useAuthStore, useStoreStore } from "@/stores";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import RazorpayCheckout from "react-native-razorpay";

export default function AuthModal() {
  const router = useRouter();
  const {
    showAuthModal,
    setShowAuthModal,
    initiateLogin,
    verifyOTP,
    loading,
    isCartCheckout,
    cartCheckoutData,
    setIsCartCheckout,
    setCartCheckoutData,
  } = useAuthStore();
  const { clearCart } = useStoreStore();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handleClose = () => {
    if (isPlacingOrder) return;
    setShowAuthModal(false);
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
    // Clear cart checkout state
    setIsCartCheckout(false);
    setCartCheckoutData(null);
  };

  const handleRazorpayPayment = async (
    orderPayload: any,
    loggedInUser: any,
    vendorData: any,
    grandTotal: number
  ) => {
    try {
      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );

      const orderResponse = await axios.post(
        `${API_URL.BASE_ORDER}/rest/big-local/api/v1/payment/order`,
        {
          amount: grandTotal,
          currency: "INR",
          orderPayload,
          userId: loggedInUser?.id,
          vendorId: vendorData?.vendorId || vendorData?.id,
          addressId: "",
        },
        {
          headers: {
            sessionToken: sessionToken || "",
            "X-USER-ROLE": USER_ROLES.USER,
          },
        }
      );

      const { id: razorpayOrderId, amount, currency } = orderResponse.data;

      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== "function") {
        Alert.alert(
          "Payment Unavailable",
          "Razorpay payment gateway is not available. Please try Pay on Delivery option or restart the app."
        );
        setIsPlacingOrder(false);
        return;
      }

      const options = {
        description: "Order Payment",
        image: vendorData?.profileImage || "/images/biglocallogo3.webp",
        currency: currency,
        key: RAZORPAY_CONFIG.KEY_ID || "",
        amount: amount,
        name: vendorData?.shopName || "BigLocal",
        order_id: razorpayOrderId,
        prefill: {
          name: loggedInUser?.name || "",
          email: loggedInUser?.emailId || "",
          contact: loggedInUser?.mobileNo || "",
        },
        theme: {
          color: "#F77C06",
        },
        notes: {
          address: vendorData?.address || "",
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          },
        },
      };

      RazorpayCheckout.open(options as any)
        .then(async (data: any) => {
          try {
            setIsPlacingOrder(true);
            const sessionToken = await AsyncStorage.getItem(
              STORAGE_KEYS.SESSION_TOKEN
            );

            const verifyResponse = await axios.post(
              `${API_URL.BASE_ORDER}/rest/big-local/api/v1/payment/verify`,
              {
                orderId: data.razorpay_order_id,
                paymentId: data.razorpay_payment_id,
                signature: data.razorpay_signature,
              },
              {
                headers: {
                  sessionToken: sessionToken || "",
                  "X-USER-ROLE": USER_ROLES.USER,
                },
              }
            );

            if (verifyResponse.data) {
              clearCart();
              // Clear cart and navigate to order confirmation page
              clearCart();
              setIsPlacingOrder(false);
              handleClose();
              router.replace({
                pathname: "/order-confirmation",
                params: {
                  orderId:
                    verifyResponse.data?.id ||
                    verifyResponse.data?.orderId ||
                    "N/A",
                  total: `₹${grandTotal.toFixed(2)}`,
                  estimatedDelivery:
                    orderPayload.attributeModels.find(
                      (attr: any) =>
                        attr.name === ORDER_ATTRIBUTE_KEYS.DELIVERY_TIME
                    )?.value || "",
                  vendorName:
                    vendorData?.shopName || vendorData?.name || "Vendor",
                  vendorContact: vendorData?.contactNo || "",
                  paymentStatus: "Paid",
                },
              });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            Alert.alert(
              "Error",
              "Payment verification failed. Please contact support."
            );
          } finally {
            setIsPlacingOrder(false);
          }
        })
        .catch((error: any) => {
          Alert.alert(
            "Payment Failed",
            `Error: ${error.code} | ${error.description}`
          );
          console.error("Payment failed:", error);
          setIsPlacingOrder(false);
        });
    } catch (error) {
      console.error("Razorpay payment error:", error);
      Alert.alert("Error", "Failed to initiate payment. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrderDirectly = async (loggedInUser: any) => {
    if (!cartCheckoutData) return;

    const { orderPayload, vendorData, grandTotal, paymentMethod } =
      cartCheckoutData;

    try {
      setIsPlacingOrder(true);

      if (!loggedInUser?.id) {
        setIsPlacingOrder(false);
        Alert.alert(
          "Error",
          "User information not available. Please try again."
        );
        handleClose();
        return;
      }

      // If prepaid, initiate Razorpay payment
      if (paymentMethod === PAYMENT_MODE.PREPAID) {
        await handleRazorpayPayment(
          orderPayload,
          loggedInUser,
          vendorData,
          grandTotal
        );
        return;
      }

      // For Pay on Delivery, place order directly
      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );

      const res = await axios.post(
        `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order?addressId=`,
        orderPayload,
        {
          headers: {
            sessionToken: sessionToken || "",
            "X-USER-ROLE": USER_ROLES.USER,
            "X-User-Id": loggedInUser?.id,
            "X-Vendor-Id": vendorData?.vendorId || vendorData?.id,
          },
        }
      );

      const deliveryTime =
        orderPayload.attributeModels.find(
          (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.DELIVERY_TIME
        )?.value || "As per schedule";

      // Clear cart and navigate to order confirmation page
      clearCart();
      setIsPlacingOrder(false);
      handleClose();
      router.replace({
        pathname: "/order-confirmation",
        params: {
          orderId: res?.data?.id || "N/A",
          total: `₹${grandTotal.toFixed(2)}`,
          estimatedDelivery: deliveryTime,
          vendorName: vendorData?.shopName || vendorData?.name || "Vendor",
          vendorContact: vendorData?.contactNo || "",
          paymentStatus: "Pay On Delivery",
        },
      });
    } catch (error: any) {
      console.error("Order placement error:", error);
      Alert.alert("Error", "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleContinue = async () => {
    if (step === "phone") {
      if (phoneNumber.length !== 10) {
        Alert.alert("Error", "Please enter a valid 10-digit mobile number");
        return;
      }

      try {
        await initiateLogin(phoneNumber);
        setStep("otp");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to send OTP");
      }
    } else {
      if (otp.length !== 6) {
        Alert.alert("Error", "Please enter a valid 6-digit OTP");
        return;
      }

      try {
        const loggedInUser = await verifyOTP(otp, phoneNumber, isCartCheckout);

        // If this is a cart checkout for Self Pickup, place order directly
        if (
          isCartCheckout &&
          cartCheckoutData?.deliveryOption === "Self Pickup" &&
          loggedInUser
        ) {
          await handlePlaceOrderDirectly(loggedInUser);
        } else {
          // For Home Delivery or non-cart checkout, just close the modal
          handleClose();
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "Invalid OTP");
      }
    }
  };

  return (
    <Modal
      visible={showAuthModal}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        className=""
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-6 w-full">
            {/* Back Button */}
            <Pressable
              className="flex items-center justify-center my-3"
              onPress={step === "otp" ? () => setStep("phone") : handleClose}
              disabled={isPlacingOrder}
            >
              <View className="bg-slate-200 size-12 items-center justify-center rounded-full">
                <FontAwesome name="close" size={24} color="black" />
              </View>
            </Pressable>

            {/* Logo */}
            <View className="items-center mb-6">
              <Image
                source={require("@/assets/images/logo.webp")}
                className="w-auto h-16 mb-3"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-center">
                Log in or Sign up
              </Text>
            </View>

            {/* Input Section */}
            {step === "phone" ? (
              <View className="mb-6">
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-4">
                  <Text className="text-lg font-semibold mr-2">+91</Text>
                  <TextInput
                    className="flex-1 text-lg py-0"
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    autoFocus
                    editable={!isPlacingOrder}
                  />
                </View>
              </View>
            ) : (
              <View className="mb-6">
                <Text className="text-gray-600 mb-2">
                  Enter OTP sent to +91{phoneNumber}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-4 text-lg text-center tracking-widest"
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                  editable={!isPlacingOrder}
                />
              </View>
            )}

            {/* Continue Button */}
            <Pressable
              onPress={handleContinue}
              disabled={loading || isPlacingOrder}
              className={`rounded-xl py-4 items-center ${
                loading || isPlacingOrder ? "bg-gray-400" : "bg-green-700"
              }`}
            >
              {loading || isPlacingOrder ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Continue
                </Text>
              )}
            </Pressable>

            {/* Terms */}
            <Text className="text-center text-gray-500 text-sm mt-4">
              By continuing, you agree to our{" "}
              <Text className="underline">Terms of service</Text> &{" "}
              <Text className="underline">Privacy policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );
}
