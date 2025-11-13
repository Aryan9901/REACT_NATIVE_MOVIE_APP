import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
