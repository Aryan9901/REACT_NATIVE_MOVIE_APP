import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface VendorLocationProps {
  vendor: any;
}

export default function VendorLocation({ vendor }: VendorLocationProps) {
  const formatAddress = () => {
    const addr = vendor?.address;
    if (!addr) return "Address not available";

    const parts = [];
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);

    return parts.length > 0 ? parts.join(", ") : "Address not available";
  };

  const handleGetDirections = () => {
    const addr = vendor?.address;
    if (!addr?.latitude || !addr?.longitude) return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${addr.latitude},${addr.longitude}`;
    Linking.openURL(url);
  };

  const handleCall = () => {
    if (vendor?.contactNo) {
      Linking.openURL(`tel:${vendor.contactNo}`);
    }
  };

  const latitude = vendor?.address?.latitude || 0;
  const longitude = vendor?.address?.longitude || 0;
  const hasValidLocation = latitude !== 0 && longitude !== 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Map Section */}
      <View className="h-96 bg-gray-200">
        {hasValidLocation ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title={vendor?.shopName || vendor?.name}
              description={formatAddress()}
            />
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="location-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">Location not available</Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View className="px-4 py-4">
        <View className="bg-white rounded-lg shadow-sm p-4">
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="location" size={24} color="#F97316" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                {vendor?.shopName || vendor?.name}
              </Text>
              <Text className="text-sm text-gray-600">{formatAddress()}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            {hasValidLocation && (
              <TouchableOpacity
                onPress={handleGetDirections}
                className="flex-1 bg-orange-600 rounded-lg py-3 flex-row items-center justify-center"
              >
                <Ionicons name="navigate" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  Directions
                </Text>
              </TouchableOpacity>
            )}

            {vendor?.contactNo && (
              <TouchableOpacity
                onPress={handleCall}
                className="flex-1 bg-white border border-gray-300 rounded-lg py-3 flex-row items-center justify-center"
              >
                <Ionicons name="call" size={20} color="#374151" />
                <Text className="text-gray-700 font-semibold ml-2">Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delivery Radius Info */}
        {vendor?.deliveryRadius && (
          <View className="mt-4 bg-blue-50 rounded-lg p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#2563EB" />
              <View className="ml-2 flex-1">
                <Text className="text-sm font-semibold text-blue-900 mb-1">
                  Delivery Area
                </Text>
                <Text className="text-xs text-blue-800">
                  We deliver within {vendor.deliveryRadius} km radius from our
                  location.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
