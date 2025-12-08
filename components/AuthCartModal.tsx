import {
  API_URL,
  ORDER_ATTRIBUTE_KEYS,
  PAYMENT_MODE,
  RAZORPAY_CONFIG,
  STORAGE_KEYS,
  USER_ROLES,
} from "@/lib/constants";
import * as AddressService from "@/services/address";
import * as AuthService from "@/services/auth";
import { fetchNearbyVendors } from "@/services/vendor.service";
import { useAuthStore, useStoreStore } from "@/stores";
import { formatAddress } from "@/utils/locationUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import RazorpayCheckout from "react-native-razorpay";

// Helper function to extract address components from Google API
const extractGoogleAddressComponents = (components: any[]): any => {
  const get = (type: string): string =>
    components.find((c: any) => c.types.includes(type))?.long_name || "";

  const streetNumber = get("street_number");
  const route = get("route");
  const premise = get("premise");
  const neighborhood = get("neighborhood");
  const sublocality = get("sublocality_level_1");

  const addressParts = [
    streetNumber,
    route,
    premise,
    neighborhood,
    sublocality,
  ].filter(Boolean);

  return {
    addressLineOne: "",
    addressLineTwo: addressParts.join(", "),
    city: get("locality") || get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    pinCode: get("postal_code"),
    country: get("country") || "India",
  };
};

interface PlacePrediction {
  place_id: string;
  description: string;
}

type Step =
  | "phone"
  | "otp"
  | "selectAddress"
  | "createAddress"
  | "paymentMethod";

export default function AuthCartModal() {
  const router = useRouter();
  const {
    showAuthModal,
    setShowAuthModal,
    initiateLogin,
    loading,
    isCartCheckout,
    cartCheckoutData,
    setIsCartCheckout,
    setCartCheckoutData,
  } = useAuthStore();
  const { clearCart, selectedVendor } = useStoreStore();

  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Address states
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    PAYMENT_MODE.PAY_ON_DELIVERY
  );

  // Determine if this is a Home Delivery checkout
  const isHomeDeliveryCheckout =
    isCartCheckout && cartCheckoutData?.deliveryOption === "Home Delivery";

  // Set initial payment method based on cart checkout data
  useEffect(() => {
    if (cartCheckoutData?.paymentMethod) {
      setSelectedPaymentMethod(cartCheckoutData.paymentMethod);
    } else if (cartCheckoutData?.allowedPaymentMethods?.length) {
      setSelectedPaymentMethod(cartCheckoutData.allowedPaymentMethods[0]);
    }
  }, [cartCheckoutData]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleClose = () => {
    if (isPlacingOrder || isVerifyingAddress) return;
    setShowAuthModal(false);
    resetState();
  };

  const resetState = () => {
    setTimeout(() => {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setLoggedInUser(null);
      setUserAddresses([]);
      setSelectedAddress(null);
      setSelectedPaymentMethod(PAYMENT_MODE.PAY_ON_DELIVERY);
      setIsCartCheckout(false);
      setCartCheckoutData(null);
    }, 300);
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }
    try {
      await initiateLogin(phoneNumber);
      setStep("otp");
      setCountdown(30);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }
    try {
      setIsPlacingOrder(true);
      const authData = await AuthService.verifyOtp(otp, phoneNumber);
      if (!authData?.sessionToken) {
        throw new Error("Invalid authentication response");
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_TOKEN,
        authData.sessionToken
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        authData.refreshToken
      );
      await AsyncStorage.setItem(STORAGE_KEYS.MOBILE, phoneNumber);

      let userData = await AuthService.getUserProfile(phoneNumber);
      if (!userData?.id) {
        userData = await AuthService.createUser(
          phoneNumber,
          authData.sessionToken
        );
      }
      if (!userData?.id) {
        throw new Error("Failed to get user data");
      }

      await AsyncStorage.removeItem(STORAGE_KEYS.GUEST_MODE);

      // Update both local state and global auth store
      setLoggedInUser(userData);
      useAuthStore.getState().setUser(userData);
      useAuthStore.getState().setIsGuestMode(false);

      // Handle different scenarios after successful login
      if (!isCartCheckout) {
        // Regular sign-in (not cart checkout) - just close the modal
        handleClose();
      } else if (isHomeDeliveryCheckout) {
        // Cart checkout with Home Delivery - go to address selection
        if (userData?.addressModel && userData.addressModel.length > 0) {
          setUserAddresses(userData.addressModel);
          setStep("selectAddress");
        } else {
          setStep("createAddress");
        }
      } else {
        // Cart checkout with Self Pickup - place order directly
        await handlePlaceOrderDirectly(userData);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid OTP");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      await initiateLogin(phoneNumber);
      setCountdown(30);
      setOtp("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend OTP");
    }
  };

  const handleAddressVerification = async (address: any) => {
    setIsVerifyingAddress(true);
    try {
      const result = await fetchNearbyVendors(
        address.latitude,
        address.longitude,
        loggedInUser
      );
      if (!result) {
        Alert.alert("Error", "Failed to verify address");
        return;
      }
      const vendorToVerify = selectedVendor;
      const isVendorAvailable = result.some(
        (vendor: any) => vendor.id === vendorToVerify?.id
      );
      if (isVendorAvailable) {
        setSelectedAddress(address);
        setStep("paymentMethod");
      } else {
        Alert.alert(
          "Address Not Serviceable",
          "This address is not serviceable by the selected vendor. Please choose another address."
        );
      }
    } catch (error) {
      console.error("Error verifying address:", error);
      Alert.alert("Error", "Failed to verify address. Please try again.");
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
      setCountdown(0);
    } else if (step === "selectAddress") {
      // Can't go back from address selection after login
    } else if (step === "createAddress") {
      if (userAddresses.length > 0) {
        setStep("selectAddress");
      }
    } else if (step === "paymentMethod") {
      setStep("selectAddress");
      setSelectedAddress(null);
    }
  };

  const handleRazorpayPayment = async (
    orderPayload: any,
    deliveryAddress: any,
    currentUser: any,
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
          userId: currentUser?.id,
          vendorId: vendorData?.vendorId || vendorData?.id,
          addressId: deliveryAddress?.id || "",
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
        Alert.alert("Payment Unavailable", "Razorpay is not available.");
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
          name: currentUser?.name || "",
          email: currentUser?.emailId || "",
          contact: currentUser?.mobileNo || "",
        },
        theme: { color: "#F77C06" },
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
            Alert.alert("Error", "Payment verification failed.");
          } finally {
            setIsPlacingOrder(false);
          }
        })
        .catch((error: any) => {
          Alert.alert(
            "Payment Failed",
            `Error: ${error.code} | ${error.description}`
          );
          setIsPlacingOrder(false);
        });
    } catch (error) {
      console.error("Razorpay payment error:", error);
      Alert.alert("Error", "Failed to initiate payment.");
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrderDirectly = async (currentUser?: any) => {
    if (!cartCheckoutData) return;
    const { orderPayload, vendorData, grandTotal, paymentMethod } =
      cartCheckoutData;
    const user = currentUser || loggedInUser;

    try {
      setIsPlacingOrder(true);
      if (!user?.id) {
        Alert.alert("Error", "User information not available.");
        handleClose();
        return;
      }

      if (paymentMethod === PAYMENT_MODE.PREPAID) {
        await handleRazorpayPayment(
          orderPayload,
          null,
          user,
          vendorData,
          grandTotal
        );
        return;
      }

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
            "X-User-Id": user?.id,
            "X-Vendor-Id": vendorData?.vendorId || vendorData?.id,
          },
        }
      );

      const deliveryTime =
        orderPayload.attributeModels.find(
          (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.DELIVERY_TIME
        )?.value || "As per schedule";

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

  const handlePlaceOrderWithAddress = async () => {
    if (!cartCheckoutData || !selectedAddress) return;
    const { orderPayload, vendorData, grandTotal } = cartCheckoutData;
    const user = loggedInUser;

    // Update order payload with selected address and payment method
    const updatedOrderPayload = {
      ...orderPayload,
      deliveryAddress: formatAddress(selectedAddress),
      attributeModels: orderPayload.attributeModels.map((attr: any) => {
        if (attr.name === ORDER_ATTRIBUTE_KEYS.PAYMENT_METHOD) {
          return { ...attr, value: selectedPaymentMethod };
        }
        if (attr.name === ORDER_ATTRIBUTE_KEYS.PAID_ON) {
          return {
            ...attr,
            value:
              selectedPaymentMethod === PAYMENT_MODE.PREPAID
                ? new Date().toISOString()
                : "",
          };
        }
        return attr;
      }),
    };

    try {
      setIsPlacingOrder(true);
      if (!user?.id) {
        Alert.alert("Error", "User information not available.");
        return;
      }

      if (selectedPaymentMethod === PAYMENT_MODE.PREPAID) {
        await handleRazorpayPayment(
          updatedOrderPayload,
          selectedAddress,
          user,
          vendorData,
          grandTotal
        );
        return;
      }

      const sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );
      const res = await axios.post(
        `${API_URL.BASE_ORDER}/rest/big-local/api/v1/order?addressId=${
          selectedAddress?.id || ""
        }`,
        updatedOrderPayload,
        {
          headers: {
            sessionToken: sessionToken || "",
            "X-USER-ROLE": USER_ROLES.USER,
            "X-User-Id": user?.id,
            "X-Vendor-Id": vendorData?.vendorId || vendorData?.id,
          },
        }
      );

      const deliveryTime =
        updatedOrderPayload.attributeModels.find(
          (attr: any) => attr.name === ORDER_ATTRIBUTE_KEYS.DELIVERY_TIME
        )?.value || "As per schedule";

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

  // Use allowedPaymentMethods from cartCheckoutData if available, otherwise fallback
  const allowedPaymentMethods = cartCheckoutData?.allowedPaymentMethods?.length
    ? cartCheckoutData.allowedPaymentMethods
    : cartCheckoutData?.paymentMethod
    ? [cartCheckoutData.paymentMethod]
    : [PAYMENT_MODE.PAY_ON_DELIVERY];

  // Render Phone Step
  const renderPhoneStep = () => (
    <View className="items-center">
      <Image
        source={require("@/assets/images/logo.webp")}
        className="w-auto h-16 mb-3"
        resizeMode="contain"
      />
      <Text className="text-2xl font-bold text-center mb-6">
        Log in or Sign up
      </Text>
      <View className="w-full mb-6">
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
      <Pressable
        onPress={handleSendOTP}
        disabled={loading || isPlacingOrder}
        className={`w-full rounded-xl py-4 items-center ${
          loading || isPlacingOrder ? "bg-gray-400" : "bg-green-700"
        }`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Continue</Text>
        )}
      </Pressable>
      <Text className="text-center text-gray-500 text-sm mt-4">
        By continuing, you agree to our Terms of service & Privacy policy
      </Text>
    </View>
  );

  // Render OTP Step
  const renderOTPStep = () => (
    <View className="items-center">
      <Text className="text-xl font-bold text-center mb-2">Verify OTP</Text>
      <Text className="text-gray-600 text-center mb-4">
        OTP sent to +91{phoneNumber}{" "}
        <Text
          className="text-blue-500 font-semibold"
          onPress={() => setStep("phone")}
        >
          edit
        </Text>
      </Text>
      <TextInput
        className="w-full border border-gray-300 rounded-xl px-4 py-4 text-lg text-center tracking-widest mb-4"
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        autoFocus
        editable={!isPlacingOrder}
      />
      <Pressable
        onPress={handleVerifyOTP}
        disabled={loading || isPlacingOrder || otp.length !== 6}
        className={`w-full rounded-xl py-4 items-center ${
          loading || isPlacingOrder || otp.length !== 6
            ? "bg-gray-400"
            : "bg-orange-500"
        }`}
      >
        {loading || isPlacingOrder ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Verify OTP</Text>
        )}
      </Pressable>
      <View className="mt-4">
        {countdown > 0 ? (
          <Text className="text-gray-600">Resend OTP in {countdown}s</Text>
        ) : (
          <Pressable onPress={handleResendOTP} disabled={loading}>
            <Text className="text-orange-600 font-semibold">Resend OTP</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  // Render Select Address Step
  const renderSelectAddressStep = () => (
    <View>
      <Text className="text-xl font-bold text-center mb-4">
        Select Delivery Address
      </Text>
      <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
        {userAddresses.map((address) => (
          <TouchableOpacity
            key={address.id}
            onPress={() => handleAddressVerification(address)}
            disabled={isVerifyingAddress}
            className={`flex-row items-start p-3 mb-2 rounded-xl border-2 ${
              isVerifyingAddress ? "opacity-50" : "border-gray-200"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                address.type?.toLowerCase() === "home"
                  ? "home"
                  : address.type?.toLowerCase() === "work"
                  ? "briefcase"
                  : "location"
              }
              size={20}
              color="#F97316"
              style={{ marginTop: 2 }}
            />
            <View className="flex-1 ml-3">
              <Text className="font-semibold text-gray-900">
                {address.type || "Other"}
              </Text>
              <Text className="text-sm text-gray-600">
                {formatAddress(address)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => setStep("createAddress")}
          disabled={isVerifyingAddress}
          className="flex-row items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl"
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color="#F97316" />
          <Text className="text-orange-600 font-semibold ml-2">
            Add New Address
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {isVerifyingAddress && (
        <View className="flex-row items-center justify-center mt-4">
          <ActivityIndicator color="#F97316" />
          <Text className="text-orange-600 ml-2">Verifying address...</Text>
        </View>
      )}
    </View>
  );

  // Render Payment Method Step
  const renderPaymentMethodStep = () => (
    <View>
      <TouchableOpacity
        onPress={handleBack}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="arrow-back" size={20} color="#6B7280" />
        <Text className="text-gray-600 ml-1">Back</Text>
      </TouchableOpacity>
      <Text className="text-xl font-bold text-center mb-4">
        Select Payment Method
      </Text>
      <View className="gap-3 mb-6">
        {allowedPaymentMethods.includes(PAYMENT_MODE.PAY_ON_DELIVERY) && (
          <TouchableOpacity
            onPress={() =>
              setSelectedPaymentMethod(PAYMENT_MODE.PAY_ON_DELIVERY)
            }
            className={`p-4 border-2 rounded-xl ${
              selectedPaymentMethod === PAYMENT_MODE.PAY_ON_DELIVERY
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedPaymentMethod === PAYMENT_MODE.PAY_ON_DELIVERY
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedPaymentMethod === PAYMENT_MODE.PAY_ON_DELIVERY && (
                  <View className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </View>
              <View>
                <Text className="font-semibold text-gray-900">
                  Pay on Delivery
                </Text>
                <Text className="text-sm text-gray-600">
                  Cash or UPI on delivery
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        {allowedPaymentMethods.includes(PAYMENT_MODE.PREPAID) && (
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod(PAYMENT_MODE.PREPAID)}
            className={`p-4 border-2 rounded-xl ${
              selectedPaymentMethod === PAYMENT_MODE.PREPAID
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200"
            }`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  selectedPaymentMethod === PAYMENT_MODE.PREPAID
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {selectedPaymentMethod === PAYMENT_MODE.PREPAID && (
                  <View className="w-3 h-3 rounded-full bg-orange-500" />
                )}
              </View>
              <View>
                <Text className="font-semibold text-gray-900">Pay Online</Text>
                <Text className="text-sm text-gray-600">
                  UPI, Cards, Wallets
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <Pressable
        onPress={handlePlaceOrderWithAddress}
        disabled={isPlacingOrder}
        className={`rounded-xl py-4 items-center ${
          isPlacingOrder ? "bg-gray-400" : "bg-orange-500"
        }`}
      >
        {isPlacingOrder ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Place Order</Text>
        )}
      </Pressable>
    </View>
  );

  // Render Create Address Step - Full form within modal
  const renderCreateAddressStep = () => (
    <CreateAddressStepComponent
      user={loggedInUser}
      onBack={handleBack}
      userAddresses={userAddresses}
      onAddressCreated={(address: any) => {
        setUserAddresses([...userAddresses, address]);
        handleAddressVerification(address);
      }}
    />
  );

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
        keyboardShouldPersistTaps="handled"
        bottomOffset={40}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-6 w-full">
            <Pressable
              className="flex items-center justify-center my-3"
              onPress={step === "otp" ? handleBack : handleClose}
              disabled={isPlacingOrder || isVerifyingAddress}
            >
              <View className="bg-slate-200 size-12 items-center justify-center rounded-full">
                <Ionicons name="close" size={24} color="black" />
              </View>
            </Pressable>

            {step === "phone" && renderPhoneStep()}
            {step === "otp" && renderOTPStep()}
            {step === "selectAddress" && renderSelectAddressStep()}
            {step === "createAddress" && renderCreateAddressStep()}
            {step === "paymentMethod" && renderPaymentMethodStep()}
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );
}

// Create Address Step Component - Full form within modal
function CreateAddressStepComponent({
  user,
  onBack,
  userAddresses,
  onAddressCreated,
}: {
  user: any;
  onBack: () => void;
  userAddresses: any[];
  onAddressCreated: (address: any) => void;
}) {
  const { refreshUser } = useAuthStore();

  const [formData, setFormData] = useState({
    addressLineOne: "",
    addressLineTwo: "",
    city: "",
    state: "",
    pinCode: "",
    type: "Home",
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addressTypes = ["Home", "Work", "Other"];

  // Auto-trigger current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Search places with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingPlaces(true);
      abortControllerRef.current = new AbortController();

      const result = await AddressService.searchPlaces(
        searchQuery,
        abortControllerRef.current.signal
      );

      if (result.success) {
        setPredictions(result.data);
        setShowPredictions(result.data.length > 0);
      }
      setSearchingPlaces(false);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  const handlePlaceSelect = async (placeId: string) => {
    setShowPredictions(false);
    setSearchingPlaces(true);

    try {
      const result = await AddressService.getPlaceDetails(placeId);

      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          addressLineTwo: result.data.addressLineTwo,
          city: result.data.city,
          state: result.data.state,
          pinCode: result.data.pinCode,
          latitude: result.data.latitude,
          longitude: result.data.longitude,
        }));
        setSearchQuery("");
        setPredictions([]);
      } else {
        Alert.alert("Error", "Failed to get place details");
      }
    } catch (error: any) {
      console.error("Error getting place details:", error);
      Alert.alert("Error", "Failed to get place details");
    } finally {
      setSearchingPlaces(false);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        status = newStatus;
      }

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable location permissions to use this feature"
        );
        setGettingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("No address found for current location");
      }

      const address = data.results[0];
      const addressComponents = extractGoogleAddressComponents(
        address.address_components || []
      );

      setFormData((prev) => ({
        ...prev,
        addressLineTwo: addressComponents.addressLineTwo,
        city: addressComponents.city,
        state: addressComponents.state,
        pinCode: addressComponents.pinCode,
        latitude,
        longitude,
      }));
    } catch (error: any) {
      console.error("Error getting current location:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to get current location. Please try again."
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.addressLineOne.trim()) {
      newErrors.addressLineOne = "Flat / House No. is required";
    }
    if (!formData.addressLineTwo.trim()) {
      newErrors.addressLineTwo = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "Invalid PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAddress = async () => {
    if (!validateForm()) {
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      Alert.alert(
        "Location Required",
        "Please select a location using search or current location"
      );
      return;
    }

    try {
      setIsCreating(true);

      const addressData = {
        addressLineOne: formData.addressLineOne,
        addressLineTwo: formData.addressLineTwo,
        city: formData.city,
        state: formData.state,
        country: "India",
        pinCode: formData.pinCode,
        type: formData.type,
        latitude: formData.latitude,
        longitude: formData.longitude,
        contactNo: user?.mobileNo || "",
      };

      const result = await AddressService.createOrUpdateAddress(
        addressData,
        user?.id
      );

      if (result.success) {
        await refreshUser();
        onAddressCreated(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to add address");
      }
    } catch (error: any) {
      console.error("Error creating address:", error);
      Alert.alert("Error", "Failed to add address. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <View>
      {/* Header with Back Button */}
      <View className="flex-row items-center mb-3">
        {userAddresses.length > 0 && (
          <TouchableOpacity
            onPress={onBack}
            disabled={isCreating}
            className="flex-row items-center mr-2"
          >
            <Ionicons name="arrow-back" size={20} color="#6B7280" />
            <Text className="text-gray-600 ml-1">Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center">
          Add New Address
        </Text>
        {userAddresses.length > 0 && <View className="w-12" />}
      </View>

      <ScrollView
        className="max-h-96"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Places */}
        <View className="mb-3">
          <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2 bg-gray-50">
            <Ionicons name="search-outline" size={20} color="#9ca3af" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for area, street, landmark..."
              className="flex-1 ml-2 text-base text-gray-900"
              placeholderTextColor="#9ca3af"
              onFocus={() => {
                if (predictions.length > 0) setShowPredictions(true);
              }}
            />
            {searchingPlaces && (
              <ActivityIndicator size="small" color="#ea580c" />
            )}
          </View>

          {/* Predictions List */}
          {showPredictions && predictions.length > 0 && (
            <View className="mt-2 bg-white border border-gray-200 rounded-xl max-h-40">
              <ScrollView nestedScrollEnabled>
                {predictions.map((prediction, index) => (
                  <TouchableOpacity
                    key={prediction.place_id}
                    onPress={() => handlePlaceSelect(prediction.place_id)}
                    className={`px-3 py-2 ${
                      index !== predictions.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start">
                      <Ionicons name="location" size={16} color="#ea580c" />
                      <Text className="flex-1 ml-2 text-sm text-gray-900">
                        {prediction.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Use Current Location Button */}
        <TouchableOpacity
          onPress={getCurrentLocation}
          disabled={gettingLocation}
          className={`py-3 px-4 rounded-xl flex-row items-center justify-center mb-3 ${
            gettingLocation ? "bg-orange-400" : "bg-orange-500"
          }`}
          activeOpacity={0.8}
        >
          {gettingLocation ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Getting Location...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text className="text-white font-semibold ml-2">
                Use Current Location
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Address Type */}
        <View className="mb-3">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Save Address As
          </Text>
          <View className="flex-row gap-3">
            {addressTypes.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateField("type", type)}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    formData.type === type
                      ? "border-orange-600"
                      : "border-gray-300"
                  }`}
                >
                  {formData.type === type && (
                    <View className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  )}
                </View>
                <Text
                  className={`ml-2 text-base ${
                    formData.type === type
                      ? "text-gray-900 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address Form Fields */}
        <View className="mb-2">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Flat / House No. / Building *
          </Text>
          <TextInput
            value={formData.addressLineOne}
            onChangeText={(value) => updateField("addressLineOne", value)}
            placeholder="e.g., Flat 101, Building A"
            className={`border rounded-xl px-3 py-2 text-base text-gray-900 ${
              errors.addressLineOne
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-gray-50"
            }`}
            placeholderTextColor="#9ca3af"
          />
          {errors.addressLineOne && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.addressLineOne}
            </Text>
          )}
        </View>

        <View className="mb-2">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Street / Area / Locality *
          </Text>
          <TextInput
            value={formData.addressLineTwo}
            onChangeText={(value) => updateField("addressLineTwo", value)}
            placeholder="e.g., MG Road, Koramangala"
            className={`border rounded-xl px-3 py-2 text-base text-gray-900 ${
              errors.addressLineTwo
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-gray-50"
            }`}
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={2}
          />
          {errors.addressLineTwo && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.addressLineTwo}
            </Text>
          )}
        </View>

        <View className="flex-row gap-3 mb-2">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              City *
            </Text>
            <TextInput
              value={formData.city}
              onChangeText={(value) => updateField("city", value)}
              placeholder="City"
              className={`border rounded-xl px-3 py-2 text-base text-gray-900 ${
                errors.city
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              placeholderTextColor="#9ca3af"
            />
            {errors.city && (
              <Text className="text-red-500 text-xs mt-1">{errors.city}</Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              PIN Code *
            </Text>
            <TextInput
              value={formData.pinCode}
              onChangeText={(value) => updateField("pinCode", value)}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              className={`border rounded-xl px-3 py-2 text-base text-gray-900 ${
                errors.pinCode
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              placeholderTextColor="#9ca3af"
            />
            {errors.pinCode && (
              <Text className="text-red-500 text-xs mt-1">
                {errors.pinCode}
              </Text>
            )}
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            State *
          </Text>
          <TextInput
            value={formData.state}
            onChangeText={(value) => updateField("state", value)}
            placeholder="State"
            className={`border rounded-xl px-3 py-2 text-base text-gray-900 ${
              errors.state
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-gray-50"
            }`}
            placeholderTextColor="#9ca3af"
          />
          {errors.state && (
            <Text className="text-red-500 text-xs mt-1">{errors.state}</Text>
          )}
        </View>
      </ScrollView>

      {/* Add Address Button */}
      <TouchableOpacity
        onPress={handleCreateAddress}
        disabled={isCreating}
        className={`py-4 rounded-xl flex-row items-center justify-center mt-2 ${
          isCreating ? "bg-gray-400" : "bg-orange-500"
        }`}
        activeOpacity={0.8}
      >
        {isCreating ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Adding...
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">
              Add Address
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
