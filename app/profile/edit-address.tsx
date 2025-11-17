import * as AddressService from "@/services/address";
import { useAuthStore } from "@/stores";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Helper function to extract address components (same as LocationPicker)
const extractGoogleAddressComponents = (components: any[]): any => {
  const get = (type: string): string =>
    components.find((c: any) => c.types.includes(type))?.long_name || "";

  const streetNumber = get("street_number");
  const route = get("route");
  const premise = get("premise");
  const neighborhood = get("neighborhood");
  const sublocality = get("sublocality_level_1");

  // Combine all parts into addressLineTwo
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

interface AddressFormData {
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  pinCode: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

interface PlacePrediction {
  place_id: string;
  description: string;
}

const EditAddress = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addressId = params.addressId as string | undefined;
  const isEditing = !!addressId;

  const { user, refreshUser } = useAuthStore();

  const [formData, setFormData] = useState<AddressFormData>({
    addressLineOne: "",
    addressLineTwo: "",
    city: "",
    state: "",
    pinCode: "",
    type: "Home",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [customType, setCustomType] = useState("");

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addressTypes = ["Home", "Work", "Other"];

  // Load address data if editing
  useEffect(() => {
    if (isEditing && user?.addressModel) {
      const address = user.addressModel.find((addr) => addr.id === addressId);
      if (address) {
        const addressType = address.type || "Home";
        const isCustomType = !addressTypes.includes(addressType);

        setFormData({
          addressLineOne: address.addressLineOne || "",
          addressLineTwo: address.addressLineTwo || "",
          city: address.city || "",
          state: address.state || "",
          pinCode: address.pinCode || "",
          type: isCustomType ? "Other" : addressType,
          latitude: address.latitude,
          longitude: address.longitude,
        });

        if (isCustomType) {
          setCustomType(addressType);
        }
      }
    }
  }, [isEditing, addressId, user]);

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
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,address_components,formatted_address`
      );

      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const place = data.result;
        const addressComponents = extractGoogleAddressComponents(
          place.address_components || []
        );

        setFormData((prev) => ({
          ...prev,
          addressLineTwo: addressComponents.addressLineTwo,
          city: addressComponents.city,
          state: addressComponents.state,
          pinCode: addressComponents.pinCode,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
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

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      // Request location permissions
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
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode
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

      // Only populate form fields - don't save to backend yet
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

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Validate custom type if "Other" is selected
    if (formData.type === "Other" && !customType.trim()) {
      Alert.alert("Error", "Please enter a custom address type");
      return;
    }

    setSaving(true);
    try {
      const finalType =
        formData.type === "Other" ? customType.trim() : formData.type;

      const addressData = {
        addressLineOne: formData.addressLineOne,
        addressLineTwo: formData.addressLineTwo,
        city: formData.city,
        state: formData.state,
        country: "India",
        pinCode: formData.pinCode,
        type: finalType,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        contactNo: user?.mobileNo || "",
      };

      let result;
      if (isEditing && addressId) {
        result = await AddressService.updateAddress(addressId, addressData);
      } else {
        result = await AddressService.createAddress(addressData);
      }

      if (result.success) {
        await refreshUser();
        Alert.alert(
          "Success",
          `Address ${isEditing ? "updated" : "added"} successfully`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.error || "Failed to save address");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to save address. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Address" : "Add New Address"}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {isEditing
              ? "Update your delivery address"
              : "Add a new delivery location"}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        style={{ position: "relative" }}
      >
        <ScrollView
          className="flex-1 px-3 py-2"
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Places */}
          <View className="bg-white rounded-xl px-4 py-2 mb-2 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="search" size={18} color="#ea580c" />
              <Text className="text-sm font-bold text-gray-700 ml-2">
                Search Address
              </Text>
            </View>
            <View>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl px-4  bg-gray-50">
                <Ionicons name="search-outline" size={20} color="#9ca3af" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search for area, street, landmark..."
                  className="flex-1 ml-3 text-base text-gray-900"
                  placeholderTextColor="#9ca3af"
                  onFocus={() => {
                    if (predictions.length > 0) setShowPredictions(true);
                  }}
                />
                {searchingPlaces && (
                  <ActivityIndicator size="small" color="#ea580c" />
                )}
              </View>
            </View>

            {/* Predictions List - Shown below search */}
            {showPredictions && predictions.length > 0 && (
              <View
                className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg"
                style={{
                  maxHeight: 240,
                  elevation: 5,
                }}
              >
                <ScrollView nestedScrollEnabled>
                  {predictions.map((prediction, index) => (
                    <TouchableOpacity
                      key={prediction.place_id}
                      onPress={() => handlePlaceSelect(prediction.place_id)}
                      className={`px-4 py-3.5 ${
                        index !== predictions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-start">
                        <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mt-0.5">
                          <Ionicons name="location" size={16} color="#ea580c" />
                        </View>
                        <Text className="flex-1 ml-3 text-sm text-gray-900 leading-5">
                          {prediction.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Location Actions */}
          <View className="bg-white rounded-xl mb-2 shadow-sm">
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={gettingLocation}
              className="py-3.5 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex-row items-center justify-center shadow-md"
              style={{
                backgroundColor: gettingLocation ? "#fb923c" : "#ea580c",
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              {gettingLocation ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Getting Location...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="navigate" size={20} color="#fff" />
                  <Text className="text-white font-semibold ml-2 text-base">
                    Use Current Location
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Address Type */}
          <View className="bg-white rounded-xl p-4 mb-2 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Ionicons name="home" size={18} color="#ea580c" />
              <Text className="text-sm font-bold text-gray-700 ml-2">
                Save Address As
              </Text>
            </View>
            <View className="flex-row gap-4">
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

            {/* Custom Type Input */}
            {formData.type === "Other" && (
              <View className="mt-3">
                <TextInput
                  value={customType}
                  onChangeText={setCustomType}
                  placeholder="Enter custom address type (e.g., Office, Gym, Friend's Place)"
                  className="border-2 border-orange-200 rounded-md px-4 text-base text-gray-900 bg-orange-50"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            )}
          </View>

          {/* Address Details */}
          <View className="bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="edit-location" size={18} color="#ea580c" />
              <Text className="text-sm font-bold text-gray-700 ml-2">
                Complete Address
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Flat / House No. / Building
              </Text>
              <TextInput
                value={formData.addressLineOne}
                onChangeText={(value) => updateField("addressLineOne", value)}
                placeholder="e.g., Flat 101, Building A"
                className="border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 bg-gray-50"
                placeholderTextColor="#9ca3af"
              />
              <Text className="text-xs text-gray-500 mt-1.5">Optional</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Street / Area / Locality *
              </Text>
              <TextInput
                value={formData.addressLineTwo}
                onChangeText={(value) => updateField("addressLineTwo", value)}
                placeholder="e.g., MG Road, Koramangala, Sector 5"
                className={`border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 ${
                  errors.addressLineTwo
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.addressLineTwo && (
                <View className="flex-row items-center mt-1.5">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.addressLineTwo}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  City *
                </Text>
                <TextInput
                  value={formData.city}
                  onChangeText={(value) => updateField("city", value)}
                  placeholder="City"
                  className={`border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 ${
                    errors.city
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  placeholderTextColor="#9ca3af"
                />
                {errors.city && (
                  <View className="flex-row items-center mt-1.5">
                    <Ionicons name="alert-circle" size={12} color="#ef4444" />
                    <Text className="text-red-500 text-xs ml-1">
                      {errors.city}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  PIN Code *
                </Text>
                <TextInput
                  value={formData.pinCode}
                  onChangeText={(value) => updateField("pinCode", value)}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  className={`border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 ${
                    errors.pinCode
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  placeholderTextColor="#9ca3af"
                />
                {errors.pinCode && (
                  <View className="flex-row items-center mt-1.5">
                    <Ionicons name="alert-circle" size={12} color="#ef4444" />
                    <Text className="text-red-500 text-xs ml-1">
                      {errors.pinCode}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                State *
              </Text>
              <TextInput
                value={formData.state}
                onChangeText={(value) => updateField("state", value)}
                placeholder="State"
                className={`border-2 rounded-xl px-4 py-3.5 text-base text-gray-900 ${
                  errors.state
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 bg-gray-50"
                }`}
                placeholderTextColor="#9ca3af"
              />
              {errors.state && (
                <View className="flex-row items-center mt-1.5">
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text className="text-red-500 text-xs ml-1">
                    {errors.state}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View className="bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`py-4 rounded-xl flex-row items-center justify-center shadow-md ${
              saving ? "bg-orange-400" : "bg-orange-600"
            }`}
            style={{
              elevation: saving ? 2 : 4,
            }}
            activeOpacity={0.8}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text className="text-white font-bold text-base ml-2">
                  {isEditing ? "Update Address" : "Save Address"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditAddress;
