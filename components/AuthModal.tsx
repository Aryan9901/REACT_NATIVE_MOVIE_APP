import { useAuth } from "@/contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
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

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, initiateLogin, verifyOTP, loading } =
    useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const handleClose = () => {
    setShowAuthModal(false);
    setStep("phone");
    setPhoneNumber("");
    setOtp("");
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
        await verifyOTP(otp, phoneNumber);
        handleClose();
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
              className="flex items-center  justify-center my-3"
              onPress={step === "otp" ? () => setStep("phone") : handleClose}
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
                />
              </View>
            )}

            {/* Continue Button */}
            <Pressable
              onPress={handleContinue}
              disabled={loading}
              className={`rounded-xl py-4 items-center ${
                loading ? "bg-gray-400" : "bg-green-700"
              }`}
            >
              {loading ? (
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
