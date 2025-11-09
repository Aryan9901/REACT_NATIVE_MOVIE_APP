import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Mock data - replace with real data later
const getMockUser = () => ({
  name: "Valued Customer",
  email: "customer@example.com",
  phone: "+91 98765 43210",
});

const getMockIsGuest = () => false;

interface MenuItem {
  icon: any;
  iconType: "FontAwesome5" | "MaterialIcons" | "Feather" | "Ionicons";
  title: string;
  subtitle?: string;
  route?: string;
  action?: () => void;
  showChevron?: boolean;
}

const Profile = () => {
  const router = useRouter();
  const user = getMockUser();
  const isGuestMode = getMockIsGuest();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          console.log("Logout");
        },
      },
    ]);
  };

  const accountItems: MenuItem[] = [
    {
      icon: "user-edit",
      iconType: "FontAwesome5",
      title: "My Profile",
      subtitle: "Manage your personal information",
      route: "/profile/edit",
      showChevron: true,
    },
    {
      icon: "history",
      iconType: "FontAwesome5",
      title: "My Orders",
      subtitle: "View and manage your orders",
      route: "/orders",
      showChevron: true,
    },
    {
      icon: "location-on",
      iconType: "MaterialIcons",
      title: "Manage Addresses",
      subtitle: "Add and edit delivery addresses",
      route: "/profile/addresses",
      showChevron: true,
    },
  ];

  const supportItems: MenuItem[] = [
    {
      icon: "mail-outline",
      iconType: "Ionicons",
      title: "Contact Us",
      subtitle: "Send us a message or feedback",
      route: "/(tabs)/contact",
      showChevron: true,
    },
    {
      icon: "information-circle-outline",
      iconType: "Ionicons",
      title: "About Us",
      subtitle: "Know more about BigLocal",
      action: async () => {
        const url = process.env.EXPO_PUBLIC_ABOUT_URL;
        if (url) {
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          }
        }
      },
      showChevron: true,
    },
    {
      icon: "help-circle-outline",
      iconType: "Ionicons",
      title: "FAQ",
      subtitle: "Frequently asked questions",
      route: "/(tabs)/faq",
      showChevron: true,
    },
  ];

  const legalItems: MenuItem[] = [
    {
      icon: "document-text-outline",
      iconType: "Ionicons",
      title: "Terms & Conditions",
      route: "/terms" as any,
      showChevron: true,
    },
    {
      icon: "shield-checkmark-outline",
      iconType: "Ionicons",
      title: "Privacy Policy",
      route: "/privacy",
      showChevron: true,
    },
    {
      icon: "cube-outline",
      iconType: "Ionicons",
      title: "Shipping Policy",
      route: "/shipping",
      showChevron: true,
    },
    {
      icon: "return-down-back",
      iconType: "Ionicons",
      title: "Return Policy",
      route: "/return-policy",
      showChevron: true,
    },
  ];

  const renderIcon = (
    iconName: string,
    iconType: MenuItem["iconType"],
    color: string
  ) => {
    const size = 22;
    switch (iconType) {
      case "FontAwesome5":
        return (
          <FontAwesome5 name={iconName as any} size={size} color={color} />
        );
      case "MaterialIcons":
        return (
          <MaterialIcons name={iconName as any} size={size} color={color} />
        );
      case "Feather":
        return <Feather name={iconName as any} size={size} color={color} />;
      case "Ionicons":
        return <Ionicons name={iconName as any} size={size} color={color} />;
    }
  };

  const renderMenuItem = (item: MenuItem, isLast: boolean = false) => (
    <TouchableOpacity
      key={item.title}
      onPress={() => {
        if (item.action) {
          item.action();
        } else if (item.route) {
          router.push(item.route as any);
        }
      }}
      className={`flex-row items-center px-4 py-4 bg-white ${!isLast ? "border-b border-gray-100" : ""}`}
      activeOpacity={0.7}
    >
      <View className="w-10 items-center">
        {renderIcon(item.icon, item.iconType, "#64748b")}
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-base text-gray-900 font-medium">
          {item.title}
        </Text>
        {item.subtitle && (
          <Text className="text-sm text-gray-500 mt-0.5">{item.subtitle}</Text>
        )}
      </View>
      {item.showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  if (isGuestMode) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-6 mb-2">
          <View className="items-center">
            <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3">
              <FontAwesome5 name="user" size={40} color="#64748b" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Guest User</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Browsing as guest
            </Text>
            <TouchableOpacity
              onPress={() => console.log("Open login")}
              className="mt-4 bg-orange-600 px-8 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
            Information & Support
          </Text>
          <View className="bg-white">
            {supportItems.map((item, index) =>
              renderMenuItem(item, index === supportItems.length - 1)
            )}
          </View>
        </View>

        <View className="mt-2 mb-4">
          <Text className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
            Legal
          </Text>
          <View className="bg-white">
            {legalItems.map((item, index) =>
              renderMenuItem(item, index === legalItems.length - 1)
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-6 mb-2">
        <View className="items-center gap-4">
          <View
            className="w-20 mb-3 h-20 rounded-full bg-slate-400 items-center justify-center shadow-md"
            style={{ backgroundColor: "#a9a9b9", marginRight: 14 }}
          >
            <FontAwesome5 name="user" size={32} color="#000" />
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-gray-900">{user.name}</Text>
            <Text className="text-sm text-gray-500 mt-1">{user.email}</Text>
            <Text className="text-sm text-gray-500">{user.phone}</Text>
          </View>
        </View>
      </View>

      <View className="mt-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
          Account Settings
        </Text>
        <View className="bg-white">
          {accountItems.map((item, index) =>
            renderMenuItem(item, index === accountItems.length - 1)
          )}
        </View>
      </View>

      <View className="mt-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
          Support & More
        </Text>
        <View className="bg-white">
          {supportItems.map((item, index) =>
            renderMenuItem(item, index === supportItems.length - 1)
          )}
        </View>
      </View>

      <View className="mt-2">
        <Text className="text-xs font-semibold text-gray-500 uppercase px-4 py-2">
          Legal
        </Text>
        <View className="bg-white">
          {legalItems.map((item, index) =>
            renderMenuItem(item, index === legalItems.length - 1)
          )}
        </View>
      </View>

      <View className="mt-2">
        <View className="bg-white">
          <TouchableOpacity
            onPress={async () => {
              const url = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
              const supported = await Linking.canOpenURL(url as any);
              if (supported) {
                await Linking.openURL(url as any);
              }
            }}
            className="flex-row items-center px-4 py-4 bg-white"
            activeOpacity={0.7}
          >
            <View className="w-10 items-center">
              <Ionicons name="storefront-outline" size={22} color="#64748b" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base text-gray-900 font-medium">
                Join us as a Seller
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                Sell on BigLocal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-2 mb-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white flex-row items-center px-4 py-4"
          activeOpacity={0.7}
        >
          <View className="w-10 items-center">
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </View>
          <Text className="flex-1 ml-3 text-base text-red-500 font-medium">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center pb-8">
        <Text className="text-xs text-gray-400">Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

export default Profile;
