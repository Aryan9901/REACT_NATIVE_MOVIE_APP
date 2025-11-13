// app/components/LocationModal.tsx
import { useGooglePlaces } from "@/hooks/useGooglePlaces";
import { useAuthStore, useLocationStore } from "@/stores";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Helper Function ---
const extractGoogleAddressComponents = (components: any[]): any => {
  const get = (type: string): string =>
    components.find((c: any) => c.types.includes(type))?.long_name || "";

  return {
    addressLineOne: `${get("premise")} ${get("route")}`.trim(),
    addressLineTwo: `${get("neighborhood")} ${get(
      "sublocality_level_1"
    )}`.trim(),
    city: get("locality") || get("administrative_area_level_2"),
    state: get("administrative_area_level_1"),
    pinCode: get("postal_code"),
    country: get("country"),
  };
};
// --- End Helper Function ---

export default function LocationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    getLiveLocation,
    loadingLocation,
    permissionState,
    locationErrorType,
    updateAddress,
    prepareLocationData,
    formatAddress,
  }: any = useLocationStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const {
    searchTerm,
    setSearchTerm,
    results: locationResults,
    isLoading: isSearching,
    error: searchError,
    getPlaceDetails,
    clearResults,
  } = useGooglePlaces(apiKey, 300);

  const isPermissionDenied =
    permissionState === "denied" || locationErrorType === "permission-denied";

  const handlePlaceSelect = async (placeId: string) => {
    try {
      const details = await getPlaceDetails(placeId);
      if (!details?.geometry?.location) return;

      const latitude = details.geometry.location.lat;
      const longitude = details.geometry.location.lng;
      const addressComponents = extractGoogleAddressComponents(
        details.address_components || []
      );
      const locationData = {
        ...addressComponents,
        latitude,
        longitude,
        formatted_address: details.formatted_address || "",
      };

      const updatedData = prepareLocationData(
        locationData,
        null,
        formatAddress
      );
      if (updatedData) updateAddress(updatedData);
      clearResults();
      setSearchFocused(false);
      onClose();
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleSaveAddress = (address: any) => {
    const updatedData = prepareLocationData(null, address, formatAddress);
    if (updatedData) updateAddress(updatedData);
    onClose();
  };

  const renderSavedAddresses = () => {
    if (!user?.addressModel || user.addressModel.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Feather name="map-pin" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No saved addresses yet</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              onClose();
              router.push("/profile"); // Assuming tab two is "Profile" or "Address"
            }}
          >
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.savedListContainer}>
        <Text style={styles.listHeader}>Saved Addresses</Text>
        <FlatList
          data={user.addressModel}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.savedItem}
              onPress={() => handleSaveAddress(item)}
            >
              <Feather name="map-pin" size={20} color="#555" />
              <View style={styles.savedItemTextContainer}>
                <Text style={styles.savedItemTitle}>{item.type}</Text>
                <Text style={styles.savedItemAddress} numberOfLines={2}>
                  {formatAddress(item)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop} onTouchEnd={onClose} />
      <View style={styles.modalContent}>
        <View style={styles.handleBar} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentBody}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search address..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            />
            {isSearching && (
              <ActivityIndicator
                style={styles.searchLoader}
                size="small"
                color="#007E5A"
              />
            )}
          </View>

          {searchFocused && locationResults.length > 0 && (
            <ScrollView
              style={styles.resultsContainer}
              keyboardShouldPersistTaps="handled"
            >
              {locationResults.map((result: any, index: number) => (
                <TouchableOpacity
                  key={result.place_id || index}
                  style={styles.resultItem}
                  onPress={() => handlePlaceSelect(result.place_id)}
                >
                  <Feather name="map-pin" size={16} color="#666" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultMainText}>
                      {result.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.resultSecondaryText}>
                      {result.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {!isPermissionDenied && (
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={() => getLiveLocation(true, onClose)}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator color="#007E5A" />
              ) : (
                <Feather name="navigation" size={20} color="#007E5A" />
              )}
              <Text style={styles.currentLocationText}>
                {loadingLocation
                  ? "Getting location..."
                  : "Use current location"}
              </Text>
            </TouchableOpacity>
          )}

          {isPermissionDenied && (
            <View style={styles.permissionDenied}>
              <Text style={styles.permissionText}>
                Location access is disabled. Please search or select a saved
                address.
              </Text>
            </View>
          )}

          {renderSavedAddresses()}
        </View>
      </View>
    </Modal>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: Platform.OS === "ios" ? "95%" : "90%",
    paddingTop: 8,
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  contentBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  searchContainer: {
    paddingTop: 10,
    zIndex: 10,
    position: "relative",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 0,
    fontSize: 16,
    height: 48,
    paddingLeft: 12,
    paddingRight: 40,
  },
  searchLoader: {
    position: "absolute",
    right: 12,
    top: 22,
  },
  resultsContainer: {
    maxHeight: 250,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 8,
    zIndex: 20,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  resultMainText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  resultSecondaryText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007E5A",
    backgroundColor: "#f0fff8",
    marginTop: 10,
    zIndex: 1,
  },
  currentLocationText: {
    color: "#007E5A",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  permissionDenied: {
    backgroundColor: "#fff3f3",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    zIndex: 1,
  },
  permissionText: {
    color: "#d9534f",
    textAlign: "center",
  },
  savedListContainer: {
    flex: 1,
    marginTop: 20,
    zIndex: 0,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  savedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  savedItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  savedItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  defaultTag: {
    fontSize: 14,
    color: "#007E5A",
    fontWeight: "normal",
  },
  savedItemAddress: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007E5A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
