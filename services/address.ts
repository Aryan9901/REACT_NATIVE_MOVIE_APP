import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export async function updateAddress(addressData: any) {
  try {
    const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.MOBILE);

    const headers: any = {
      "X-USER-ROLE": USER_ROLES.USER,
      sessionToken: sessionToken,
      "X-User-Id": userId,
    };

    const response = await axios.post(
      `${API_URL.BASE_USER}/rest/big-local/api/v1/user/address`,
      addressData,
      { headers }
    );

    return {
      success: true,
      data: response?.data,
      error: null,
    };
  } catch (error: any) {
    console.error("Error updating address:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || "Failed to update address",
    };
  }
}

export async function createOrUpdateAddress(addressData: any, userId: string) {
  try {
    const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

    const headers: any = {
      "X-USER-ROLE": USER_ROLES.USER,
      sessionToken: sessionToken,
      "X-User-Id": userId,
    };

    const response = await axios.post(
      `${API_URL.BASE_USER}/rest/big-local/api/v1/user/address`,
      addressData,
      { headers }
    );

    return {
      success: true,
      data: response?.data,
      error: null,
    };
  } catch (error: any) {
    console.error("Error creating address:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || "Failed to create address",
    };
  }
}

export async function searchPlaces(query: string, signal?: AbortSignal) {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_MAPS_API_KEY}&components=country:in`,
      { signal }
    );

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(data.error_message || "Failed to search places");
    }

    return {
      success: true,
      data: data.predictions || [],
      error: null,
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return { success: false, data: [], error: "Request aborted" };
    }
    console.error("Error searching places:", error);
    return {
      success: false,
      data: [],
      error: error.message || "Failed to search places",
    };
  }
}

export async function getPlaceDetails(placeId: string) {
  try {
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(data.error_message || "Failed to get place details");
    }

    const place = data.result;
    const getComponent = (type: string): string =>
      place.address_components.find((c: any) => c.types.includes(type))
        ?.long_name || "";

    const streetNumber = getComponent("street_number");
    const route = getComponent("route");
    const addressLine = [streetNumber, route].filter(Boolean).join(" ");

    return {
      success: true,
      data: {
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
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        formatted_address: place.formatted_address,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("Error getting place details:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to get place details",
    };
  }
}

export async function fetchNearbyAddress(
  latitude: any,
  longitude: any,
  userId: any,
  signal: any
) {
  try {
    if (Number(latitude) === 0 && Number(longitude) === 0) {
      console.warn("Location not available, cannot fetch vendors");
      return {
        success: false,
        data: [],
        error: "Location not available",
      };
    }

    // Check if user is in guest mode
    const guestMode = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
    const isGuest = guestMode === "true";
    if (isGuest) {
      return {
        success: false,
        data: [],
        error: "sign in first",
      };
    }

    const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);

    const headers: any = {
      "X-USER-ROLE": USER_ROLES.USER,
      sessionToken: sessionToken,
      "X-User-Id": userId,
    };

    const response = await axios.get(
      `${
        API_URL.BASE_USER
      }/rest/big-local/api/v1/user/nearby-delivery-address?latitude=${Number(
        latitude
      )}&longitude=${Number(longitude)}`,
      {
        signal,
        headers,
      }
    );

    return {
      success: true,
      data: response?.data,
      error: null,
    };
  } catch (error: any) {
    if (error.name === "CanceledError") {
      return {
        success: false,
        data: null,
        error: "Request aborted",
      };
    }
    console.error("Error fetching nearby address:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch nearby address",
    };
  }
}
