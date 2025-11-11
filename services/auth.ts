import { API_URL, STORAGE_KEYS, USER_ROLES } from "@/lib/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

interface User {
  id: string;
  name: string;
  emailId: string;
  mobileNo: string;
  alternateContact: string;
  addressModel: Array<{
    id: string;
    addressLineOne: string;
    addressLineTwo: string;
    type: string;
    city: string;
    state: string;
    country: string;
    contactNo: string;
    pinCode: string;
    latitude: number;
    longitude: number;
  }>;
}

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};

export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const sendOtp = async (mobile: string): Promise<any> => {
  const url = `${API_URL.BASE_AUTH}/rest/big-local/api/v1/auth/otp/send?role=${USER_ROLES.USER}&phoneNumber=%2B91${mobile}`;
  console.log(url);

  const { data } = await axios.post(url);
  console.log(data);

  return data;
};

export const verifyOtp = async (otp: string, mobile: string): Promise<any> => {
  const url = `${API_URL.BASE_AUTH}/rest/big-local/api/v1/auth/otp/verify?otp=${otp}&role=${USER_ROLES.USER}&phoneNumber=%2B91${mobile}`;
  const { data } = await axios.post(url);
  console.log(data);
  return data;
};

export const createUser = async (
  mobile: string,
  sessionToken: string
): Promise<User> => {
  const url = `${API_URL.BASE_USER}/rest/big-local/api/v1/user`;
  const headers = {
    sessionToken,
    "X-USER-ROLE": USER_ROLES.USER,
  };
  const { data } = await axios.post(
    url,
    {
      mobileNo: `+91${mobile}`,
    },
    { headers }
  );
  return data as User;
};

export const getUserProfile = async (mobile: string): Promise<User | null> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  if (!sessionToken) {
    return null;
  }
  const url = `${API_URL.BASE_USER}/rest/big-local/api/v1/user?mobileNo=%2B91${mobile}`;
  const headers = {
    sessionToken,
    "X-USER-ROLE": USER_ROLES.USER,
  };
  try {
    const { data } = await axios.get(url, { headers });
    return data as User;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateUserProfile = async (
  name: string,
  emailId: string,
  mobileNo: string
): Promise<User> => {
  const sessionToken = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  if (!sessionToken) {
    throw new Error("No session token found");
  }
  const url = `${API_URL.BASE_USER}/rest/big-local/api/v1/user`;
  const headers = {
    sessionToken,
    "X-USER-ROLE": USER_ROLES.USER,
  };
  const { data } = await axios.put(
    url,
    {
      name,
      emailId,
      mobileNo,
    },
    { headers }
  );
  return data as User;
};
