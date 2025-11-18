import { useStoreStore } from "@/stores";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface TabItemProps {
  focused: boolean;
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  badge?: number;
}

function TabItem({ focused, icon, title, onPress, badge }: TabItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center py-2"
    >
      <View className="items-center gap-1">
        <View className="relative">
          {icon}
          {badge !== undefined && badge > 0 && (
            <View className="absolute -top-1 -right-2 bg-orange-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
              <Text className="text-white text-[10px] font-bold">
                {badge > 99 ? "99+" : badge}
              </Text>
            </View>
          )}
        </View>
        <Text
          className={`text-xs font-semibold ${
            focused ? "text-orange-500" : "text-gray-400"
          }`}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartItemCount } = useStoreStore();

  const tabs = [
    {
      name: "Home",
      path: "/",
      icon: (focused: boolean) => (
        <FontAwesome5
          name="home"
          size={20}
          color={focused ? "#f77b05" : "#a9a9b9"}
        />
      ),
    },
    {
      name: "Orders",
      path: "/orders",
      icon: (focused: boolean) => (
        <FontAwesome5
          name="history"
          size={20}
          color={focused ? "#f77b05" : "#a9a9b9"}
        />
      ),
    },
    {
      name: "Cart",
      path: "/cart",
      icon: (focused: boolean) => (
        <Entypo
          name="shopping-cart"
          size={20}
          color={focused ? "#f77b05" : "#a9a9b9"}
        />
      ),
      badge: cartItemCount,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (focused: boolean) => (
        <FontAwesome
          name="user"
          size={20}
          color={focused ? "#f77b05" : "#a9a9b9"}
        />
      ),
    },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row h-16 shadow-lg">
      {tabs.map((tab) => {
        const isFocused =
          pathname === tab.path || pathname.startsWith(tab.path + "/");
        return (
          <TabItem
            key={tab.name}
            focused={isFocused}
            icon={tab.icon(isFocused)}
            title={tab.name}
            onPress={() => router.push(tab.path as any)}
            badge={tab.badge}
          />
        );
      })}
    </View>
  );
}
