import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";

// Only initialize Reactotron in development
if (__DEV__) {
  Reactotron.setAsyncStorageHandler(AsyncStorage)
    .configure({
      name: "React Native Demo",
    })
    .useReactNative({
      asyncStorage: true, // there are more options to the async storage.
      networking: {
        // optionally, you can turn it off with false.
        ignoreUrls: false,
      },
      editor: true, // there are more options to editor
      errors: { veto: (stackFrame) => false }, // or turn it off with false
      overlay: false, // just turning off overlay
    })
    .connect();

  // Make Reactotron available globally for easy access
  console.tron = Reactotron;
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
