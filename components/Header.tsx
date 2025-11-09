import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data for now - will be replaced with real data later
const getMockVendor = () => ({
  id: "1",
  shopName: "Fresh Market Store",
  vendorName: "John's Shop",
});

const getMockCartItems = () => 3;
const getMockIsGuest = () => true;

interface HeaderProps {
  page?: string;
}

function Header({ page }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const vendor = getMockVendor();
  const totalItems = getMockCartItems();
  const isCartEmpty = totalItems === 0;
  const isGuestMode = getMockIsGuest();

  const isStorePage = pathname === "/store";

  const handleNavigate = (path: string) => {
    router.push(path as any);
  };

  const goToVendorProfile = () => {
    if (!vendor) return;
    router.push("/vendor/profile" as any);
  };

  return (
    <SafeAreaView edges={["top"]} className="w-full bg-white shadow-md">
      <View className="flex-row items-center justify-between gap-2 px-3">
        {/* Logo or Vendor Info */}
        <View className="flex-row items-center gap-2">
          {isStorePage && vendor?.id ? (
            <TouchableOpacity
              onPress={goToVendorProfile}
              className="flex-row items-center gap-2"
            >
              <Entypo name="shop" size={16} color="#ea580c" />
              <View className="flex-col">
                <Text
                  className="text-base font-semibold text-slate-800 max-w-[180px]"
                  numberOfLines={1}
                >
                  {vendor.shopName}
                </Text>
                <View className="flex-row items-center gap-2">
                  {vendor.vendorName &&
                    vendor.vendorName !== vendor.shopName && (
                      <Text className="text-xs text-slate-600">
                        {vendor.vendorName}
                      </Text>
                    )}
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs text-green-800 font-bold">
                      Profile
                    </Text>
                    <Feather name="external-link" size={12} color="#166534" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handleNavigate("/")}
              className="flex-row items-center gap-2"
            >
              <Image
                source={require("@/assets/images/logo.webp")}
                className="max-w-32 h-20"
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Right-side Icons */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => handleNavigate("/cart")}
            className="relative"
          >
            <Entypo name="shopping-cart" size={24} color="#64748b" />
            {!isCartEmpty && (
              <View className="absolute -top-2 -right-2 bg-[#F77C06] rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                <Text className="text-white text-xs font-bold">
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => handleNavigate("/profile")}
              className="bg-gray-300 rounded-full size-10 flex items-center justify-center"
            >
              <FontAwesome5 name="user" size={20} color="#000" />
            </TouchableOpacity>

            {isGuestMode && (
              <TouchableOpacity
                onPress={() => {
                  // Open login modal - for now just navigate
                  console.log("Open login modal");
                }}
                className="px-2 py-1 bg-orange-600 rounded-md"
              >
                <Text className="text-white text-sm font-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Header;
