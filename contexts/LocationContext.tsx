// app/contexts/LocationContext.tsx
import { fetchNearbyAddress } from "@/services/address";
import { formatAddress } from "@/utils/locationUtils";
import * as Location from "expo-location";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "./AuthContext";

// --- Types ---
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
// --- End Types ---

// --- Address Utility Functions ---

const prepareLocationData = (
  locationData: any,
  savedAddress: any | null = null,
  formatAddressUtil: (addr: any) => string
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
        formatted_address: formatAddressUtil(savedAddress) || "",
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
// --- End Utility Functions ---

const LocationContext = createContext(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<PreparedLocation | null>(null);
  const [isLocationTurnedOff, setLocationTurnedOff] = useState<boolean>(false);
  const [locationErrorType, setLocationErrorType] = useState("");
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<string>("prompt");
  const [shouldOpenDrawer, setShouldOpenDrawer] = useState<boolean>(false);
  const { user } = useAuth();
  const toast = useToast();
  const hasRetriedLocation = useRef<boolean>(false);

  const checkPermissionStatus = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setPermissionState(status);
    if (status === "denied") {
      setLocationTurnedOff(true);
      setLocationErrorType("permission-denied");
    }
    return status;
  }, []);

  const handleConfirm = useCallback(
    async (locationData: any) => {
      try {
        setLoadingLocation(true);
        const updatedData = prepareLocationData(
          locationData,
          null,
          formatAddress
        );

        if (updatedData) {
          setLocation(updatedData);
        }

        setLocationTurnedOff(false);
        setLocationErrorType("");
        hasRetriedLocation.current = false;
        return updatedData;
      } catch (error) {
        console.error("Error confirming location:", error);
        toast.show("Failed to process location data", { type: "danger" });
        throw error;
      } finally {
        setLoadingLocation(false);
      }
    },
    [toast]
  );

  const handleLocationError = useCallback((errorType: string) => {
    console.error("Geolocation error:", errorType);
    setLoadingLocation(false);

    if (
      Platform.OS === "ios" &&
      (errorType === "permission-denied" ||
        errorType === "position-unavailable")
    ) {
      setShouldOpenDrawer(true);
      setPermissionState("denied");
    } else {
      setLocationErrorType(errorType);
      setLocationTurnedOff(true);
      if (errorType === "permission-denied") {
        setPermissionState("denied");
        hasRetriedLocation.current = true;
      }
    }
    if (errorType === "timeout") {
      if (!hasRetriedLocation.current) {
        hasRetriedLocation.current = true;
        setTimeout(() => getLiveLocation(false, null, false), 1000);
        return;
      }
      setLocationTurnedOff(true);
    }
  }, []);

  const getLiveLocation = async (
    isModal: boolean = false,
    func?: any,
    showToast: boolean = true
  ) => {
    try {
      setLoadingLocation(true);
      setLocationErrorType("");

      // Step 1: Request location permissions
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

      setPermissionState("granted");

      // Step 2: Get GPS coordinates using expo-location
      const accuracy = hasRetriedLocation.current
        ? Location.Accuracy.High // if not work change this to Balanced
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

      // Step 3: Use Google Geocoding API to get address from coordinates
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error("No address found for coordinates");
      }

      const address = data.results[0];

      // Extract address components from Google response
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

      const isNearbyAddress = await fetchNearbyAddress(
        latitude,
        longitude,
        user?.id,
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
        // Confirm and update location
        await handleConfirm(nearbyAddress);
      } else {
        // Confirm and update location
        await handleConfirm(locationData);
      }

      if (isModal && func) func();
      return true;
    } catch (error: any) {
      console.error("Error in getLiveLocation:", error);
      setLoadingLocation(false);

      if (error.message.includes("Timeout")) handleLocationError("timeout");
      else if (error.message.includes("Permission"))
        handleLocationError("permission-denied");
      else handleLocationError("unknown");

      if (showToast) {
        toast.show("Failed to get location. Please try again.", {
          type: "danger",
        });
      }
      return false;
    }
  };

  const updateAddress = useCallback((address: PreparedLocation) => {
    setLocation(address);
    setLocationTurnedOff(false);
    setLocationErrorType("");
  }, []);

  const contextValue: any = {
    location,
    loadingLocation,
    isLocationTurnedOff,
    locationErrorType,
    permissionState,
    shouldOpenDrawer,
    updateAddress,
    setLocation,
    getLiveLocation,
    checkPermissionStatus,
    prepareLocationData,
    formatAddress,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
