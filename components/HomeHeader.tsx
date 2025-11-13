import { useAuthStore, useLocationStore } from "@/stores";
import { Entypo } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationPicker from "./LocationPicker";

function HomeHeader() {
  const router = useRouter();
  const { isAuthenticated, setShowAuthModal } = useAuthStore();
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const isGuestMode = !isAuthenticated;

  return (
    <>
      <SafeAreaView edges={["top"]} className="w-full bg-white shadow-md">
        <View className="flex-row pb-1 pt-2 items-center justify-between gap-2 px-3">
          <LocationSelector setOpen={setShowLocationPicker} />

          {/* Right-side Icons */}
          <View className="flex-row items-center gap-2">
            {isGuestMode ? (
              <TouchableOpacity
                onPress={() => setShowAuthModal(true)}
                className="px-3 py-2 bg-orange-600 rounded-md"
              >
                <Text className="text-white text-base font-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/profile")}
                className="px-2"
              >
                <FontAwesome name="user-circle" size={32} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />
    </>
  );
}

export default HomeHeader;

const LocationSelector = ({
  setOpen,
}: {
  setOpen: (action: boolean) => void;
}) => {
  const { location, loading: loadingLocation }: any = useLocationStore();

  let displayAddress =
    location && location?.address
      ? `${location?.address?.addressLineOne || ""}${
          location?.address?.addressLineTwo
            ? ", " + location?.address?.addressLineTwo
            : ""
        }`
      : loadingLocation
      ? "Detecting Location..."
      : "Select Location";

  displayAddress = displayAddress.replace(/^, |, $/g, "");

  return (
    <TouchableOpacity
      onPress={() => setOpen(true)}
      className="flex-row items-center gap-4 flex-1 py-1 px-0 rounded-lg"
    >
      <FontAwesome name="map-marker" size={24} color="orange" />
      <View>
        <Text className="text-sm font-bold leading-3 uppercase text-orange-500">
          Delivering to
        </Text>
        <View className="flex-row items-center">
          <Text
            className="font-semibold max-w-52 text-sm text-gray-800"
            numberOfLines={1}
          >
            {location?.address?.type && (
              <Text className="font-bold">
                {location.address.type.charAt(0).toUpperCase() +
                  location.address.type.slice(1)}{" "}
                -{" "}
              </Text>
            )}
            {displayAddress}
          </Text>
          <Entypo name="chevron-down" size={24} color="black" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
