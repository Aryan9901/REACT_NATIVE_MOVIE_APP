import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Reactotron from "reactotron-react-native";

// Only initialize Reactotron in development
if (__DEV__) {
  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: "React Native Demo",
      host: "192.168.1.9", // Use your computer's IP if on physical device (e.g., "192.168.1.100")
    })
    .useReactNative({
      asyncStorage: true,
      networking: {
        ignoreUrls: /symbolicate|127.0.0.1/,
      },
      editor: true,
      errors: { veto: () => false },
      overlay: false,
    })
    .connect();

  // Make Reactotron available globally for easy access
  console.tron = Reactotron;

  // Axios interceptors for better network tracking
  axios.interceptors.request.use(
    (config) => {
      console.tron.log(
        `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
      console.tron.display({
        name: "API REQUEST",
        preview: `${config.method?.toUpperCase()} ${config.url}`,
        value: {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data,
        },
      });
      return config;
    },
    (error) => {
      console.tron.error("Request Error", error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.tron.log(
        `📥 API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`
      );
      console.tron.display({
        name: "API RESPONSE",
        preview: `${response.status} ${response.config.url}`,
        value: {
          url: response.config.url,
          status: response.status,
          data: response.data,
        },
      });
      return response;
    },
    (error) => {
      // Safely extract error data to prevent Reactotron from crashing
      const errorData = {
        url: error.config?.url || "Unknown URL",
        method: error.config?.method?.toUpperCase() || "Unknown Method",
        status: error.response?.status || "No Status",
        statusText: error.response?.statusText || "",
        message: error.message || "Unknown Error",
      };

      // Only include response data if it exists and is not too large
      if (error.response?.data) {
        try {
          const dataStr = JSON.stringify(error.response.data);
          // Limit data size to prevent crashes (max 5000 chars)
          errorData.responseData =
            dataStr.length > 5000
              ? dataStr.substring(0, 5000) + "... [truncated]"
              : error.response.data;
        } catch (e) {
          errorData.responseData = "[Unable to serialize response data]";
        }
      }

      console.tron.error(`❌ API Error: ${errorData.status} ${errorData.url}`);
      console.tron.display({
        name: "API ERROR",
        preview: `${errorData.status} ${errorData.method} ${errorData.url}`,
        value: errorData,
        important: true,
      });

      return Promise.reject(error);
    }
  );
} else {
  // In production, create a no-op console.tron to prevent errors
  console.tron = {
    log: () => {},
    warn: () => {},
    error: () => {},
    display: () => {},
    image: () => {},
  };
}
