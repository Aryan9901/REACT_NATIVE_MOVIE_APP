import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export async function fetchNearbyVendors(
  latitude: any,
  longitude: any,
  user: any
) {
  try {
    if (Number(latitude) === 0 && Number(longitude) === 0) {
      console.warn("Location not available, cannot fetch vendors");
      return null;
    }

    // Check if user is in guest mode
    const guestMode = await AsyncStorage.getItem(STORAGE_KEYS.GUEST_MODE);
    const isGuest = guestMode === "true";
    const headers: any = {
      "X-USER-ROLE": USER_ROLES.USER,
    };

    if (!isGuest) {
      headers.sessionToken = await AsyncStorage.getItem(
        STORAGE_KEYS.SESSION_TOKEN
      );
    }

    const response = await axios.get(
      `${
        API_URL.BASE_VENDOR
      }/rest/big-local/api/v1/vendor/near-by-vendors?lat=${Number(
        latitude
      )}&lng=${Number(longitude)}`,
      {
        headers,
      }
    );

    return response?.data;
  } catch (error: any) {
    if (error.name === "CanceledError") {
      return null;
    }
    console.error("Error fetching nearby vendors:", error);
    return null;
  }
}
