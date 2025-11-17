import RefreshableScrollView from "@/components/RefreshableScrollView";
import { useAuthStore } from "@/stores";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Address {
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

const ManageAddresses = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { user } = useAuthStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // TODO: Fetch addresses from API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to refresh addresses:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatAddressDisplay = (address: Address) => {
    const parts = [
      address.unitNo,
      address.addressLineOne,
      address.addressLineTwo,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const formatLocationDisplay = (address: Address) => {
    return `${address.city}, ${address.state} ${address.pinCode}`;
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      default:
        return "location";
    }
  };

  useEffect(() => {
    if (user?.id && user?.addressModel) {
      setAddresses(user?.addressModel as any);
    }
  }, [user]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          Manage Addresses
        </Text>
      </View>

      <RefreshableScrollView
        className="flex-1"
        onRefresh={handleRefresh}
        refreshing={refreshing}
      >
        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="location-off" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-base mt-4">
              No addresses saved
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Add your first delivery address
            </Text>
          </View>
        ) : (
          <View className="p-4">
            {addresses.map((address) => (
              <View
                key={address.id}
                className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                      <Ionicons
                        name={getAddressTypeIcon(address.type) as any}
                        size={20}
                        color="#ea580c"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {address.type}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/profile/edit-address",
                          params: { addressId: address.id },
                        } as any)
                      }
                      className="flex-1 flex-row items-center justify-center py-2 bg-orange-50 rounded-lg"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil" size={16} color="#ea580c" />
                      <Text className="text-orange-600 font-medium ml-2">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="ml-13">
                  <Text className="text-sm text-gray-700 leading-5 mb-1">
                    {formatAddressDisplay(address)}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {formatLocationDisplay(address)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </RefreshableScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.push("/profile/edit-address" as any)}
          className="bg-orange-600 py-4 rounded-lg flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">
            Add New Address
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ManageAddresses;
