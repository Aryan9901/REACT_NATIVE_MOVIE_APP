import { fetchNearbyAddress } from "@/services/address";
import { formatAddress } from "@/utils/locationUtils";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { create } from "zustand";

export interface AppAddress {
  id: string;
  unitNo: string;
  addressLineOne: string;
  addressLineTwo: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  type: string;
}

export interface PreparedLocation {
  address: AppAddress;
  latitude: number | undefined;
  longitude: number | undefined;
  formatted_address: string;
}

interface LocationState {
  location: PreparedLocation | null;
  loadingLocation: boolean;
  isLocationTurnedOff: boolean;
  locationErrorType: string;
  permissionState: string;
  shouldOpenDrawer: boolean;
  hasRetriedLocation: boolean;

  // Actions
  setLocation: (location: PreparedLocation | null) => void;
  setLoadingLocation: (loading: boolean) => void;
  setLocationTurnedOff: (turnedOff: boolean) => void;
  setLocationErrorType: (errorType: string) => void;
  setPermissionState: (state: string) => void;
  setShouldOpenDrawer: (should: boolean) => void;
  checkPermissionStatus: () => Promise<string>;
  getLiveLocation: (
    isModal?: boolean,
    func?: any,
    showToast?: boolean,
    userId?: string | null,
    toastInstance?: any
  ) => Promise<boolean>;
  updateAddress: (address: PreparedLocation) => void;
  prepareLocationData: (
    locationData: any,
    savedAddress?: any | null
  ) => PreparedLocation | null;
}

const prepareLocationDataUtil = (
  locationData: any,
  savedAddress: any | null = null
): PreparedLocation | null => {
  try {
    if (savedAddress && savedAddress?.id) {
      return {
        address: {
          id: savedAddress.id || "",
          unitNo: savedAddress.unitNo || "",
          addressLineOne: savedAddress.addressLineOne || "",
          addressLineTwo: savedAddress.addressLineTwo || "",
          city: savedAddress.city || "",
          state: savedAddress.state || "",
          country: savedAddress.country || "India",
          pinCode: savedAddress.pinCode || "",
          type: savedAddress.type || "",
        },
        latitude: savedAddress.latitude,
        longitude: savedAddress.longitude,
        formatted_address: formatAddress(savedAddress) || "",
      };
    } else if (locationData) {
      return {
        address: {
          id: locationData?.id || "",
          unitNo: "",
          addressLineOne: locationData.addressLineOne || "",
          addressLineTwo: locationData.addressLineTwo || "",
          city: locationData.city || "",
          state: locationData.state || "",
          country: locationData.country || "India",
          pinCode: locationData.pinCode || "",
          type: locationData?.type || "",
        },
        latitude: locationData.lat ?? locationData.latitude,
        longitude: locationData.lng ?? locationData.longitude,
        formatted_address: locationData.formatted_address || "",
      };
    }
    return null;
  } catch (error) {
    console.error("Error preparing location data:", error);
    return null;
  }
};

export const useLocationStore = create<LocationState>((set, get) => ({
  location: null,
  loadingLocation: false,
  isLocationTurnedOff: false,
  locationErrorType: "",
  permissionState: "prompt",
  shouldOpenDrawer: false,
  hasRetriedLocation: false,

  setLocation: (location) => set({ location }),
  setLoadingLocation: (loadingLocation) => set({ loadingLocation }),
  setLocationTurnedOff: (isLocationTurnedOff) => set({ isLocationTurnedOff }),
  setLocationErrorType: (locationErrorType) => set({ locationErrorType }),
  setPermissionState: (permissionState) => set({ permissionState }),
  setShouldOpenDrawer: (shouldOpenDrawer) => set({ shouldOpenDrawer }),

  checkPermissionStatus: async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    set({ permissionState: status });
    if (status === "denied") {
      set({
        isLocationTurnedOff: true,
        locationErrorType: "permission-denied",
      });
    }
    return status;
  },

  updateAddress: (address) => {
    set({
      location: address,
      isLocationTurnedOff: false,
      locationErrorType: "",
    });
  },

  prepareLocationData: (locationData, savedAddress = null) => {
    return prepareLocationDataUtil(locationData, savedAddress);
  },

  getLiveLocation: async (
    isModal = false,
    func = null,
    showToast = true,
    userId = null,
    toastInstance = null
  ) => {
    const state = get();

    const handleLocationError = (errorType: string) => {
      console.error("Geolocation error:", errorType);
      set({ loadingLocation: false });

      if (
        Platform.OS === "ios" &&
        (errorType === "permission-denied" ||
          errorType === "position-unavailable")
      ) {
        set({ shouldOpenDrawer: true, permissionState: "denied" });
      } else {
        set({ locationErrorType: errorType, isLocationTurnedOff: true });
        if (errorType === "permission-denied") {
          set({ permissionState: "denied", hasRetriedLocation: true });
        }
      }

      if (errorType === "timeout") {
        if (!state.hasRetriedLocation) {
          set({ hasRetriedLocation: true });
          setTimeout(
            () =>
              get().getLiveLocation(false, null, false, userId, toastInstance),
            1000
          );
          return;
        }
        set({ isLocationTurnedOff: true });
      }
    };

    const handleConfirm = async (locationData: any) => {
      try {
        set({ loadingLocation: true });
        const updatedData = prepareLocationDataUtil(locationData, null);

        if (updatedData) {
          set({
            location: updatedData,
            isLocationTurnedOff: false,
            locationErrorType: "",
            hasRetriedLocation: false,
          });
        }

        return updatedData;
      } catch (error) {
        console.error("Error confirming location:", error);
        if (toastInstance) {
          toastInstance.show("Failed to process location data", {
            type: "danger",
          });
        }
        throw error;
      } finally {
        set({ loadingLocation: false });
      }
    };

    try {
      set({ loadingLocation: true, locationErrorType: "" });

      // Request location permissions
      let { status } = await Location.getForegroundPermissionsAsync();

      if (status !== "granted") {
        const { status: newStatus } =
          await Location.requestForegroundPermissionsAsync();
        status = newStatus;
      }

      if (status !== "granted") {
        handleLocationError("permission-denied");
        return false;
      }

      set({ permissionState: "granted" });

      // Get GPS coordinates
      const accuracy = state.hasRetriedLocation
        ? Location.Accuracy.High
        : Location.Accuracy.High;

      let position;
      try {
        position = await Location.getCurrentPositionAsync({
          accuracy,
          timeInterval: 10000,
        });
      } catch (positionError: any) {
        console.error("Position error:", positionError);
        if (positionError.message?.includes("unavailable")) {
          handleLocationError("position-unavailable");
        } else {
          handleLocationError("unknown");
        }
        return false;
      }

      const { latitude, longitude } = position.coords;

      const isNearbyAddress = await fetchNearbyAddress(
        latitude,
        longitude,
        userId,
        null
      );

      let nearbyAddress;

      if (isNearbyAddress?.success && isNearbyAddress?.data?.id) {
        nearbyAddress = {
          formatted_address: formatAddress(isNearbyAddress?.data),
          latitude: isNearbyAddress?.data?.latitude,
          longitude: isNearbyAddress?.data?.longitude,
          addressLineOne: isNearbyAddress?.data?.addressLineOne,
          addressLineTwo: isNearbyAddress?.data?.addressLineTwo,
          city: isNearbyAddress?.data?.city,
          state: isNearbyAddress?.data?.state,
          pinCode: isNearbyAddress?.data?.pinCode,
          country: isNearbyAddress?.data?.country,
          type: isNearbyAddress?.data?.type,
          id: isNearbyAddress?.data?.id,
        };
        await handleConfirm(nearbyAddress);
        if (isModal && func) func();
        return true;
      }

      // Use Google Geocoding API
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("No address found for coordinates");
      }

      const address = data.results[0];

      const getComponent = (type: string): string =>
        address.address_components.find((c: any) => c.types.includes(type))
          ?.long_name || "";

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");
      const addressLine = [streetNumber, route].filter(Boolean).join(" ");

      const addressComponents = {
        addressLineOne: "",
        addressLineTwo: `${addressLine} ${getComponent(
          "premise"
        )} ${getComponent("neighborhood")} ${getComponent(
          "sublocality_level_1"
        )}`.trim(),
        city:
          getComponent("locality") ||
          getComponent("administrative_area_level_2"),
        state: getComponent("administrative_area_level_1"),
        pinCode: getComponent("postal_code"),
        country: getComponent("country") || "India",
      };

      const locationData = {
        ...addressComponents,
        latitude: latitude,
        longitude: longitude,
        formatted_address: address.formatted_address,
      };

      await handleConfirm(locationData);

      if (isModal && func) func();
      return true;
    } catch (error: any) {
      console.error("Error in getLiveLocation:", error);
      set({ loadingLocation: false });

      if (error.message.includes("Timeout")) handleLocationError("timeout");
      else if (error.message.includes("Permission"))
        handleLocationError("permission-denied");
      else handleLocationError("unknown");

      if (showToast && toastInstance) {
        toastInstance.show("Failed to get location. Please try again.", {
          type: "danger",
        });
      }
      return false;
    }
  },
}));
