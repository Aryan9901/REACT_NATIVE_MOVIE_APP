import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

import Header from "@/components/Header";
import { useStoreStore } from "@/stores";

function TabIcon({ focused, icon, title, isIconComponent, badge }: any) {
  return (
    <View className="h-96 min-w-24 flex gap-1 justify-center items-center">
      <View className="relative">
        {isIconComponent ? (
          icon
        ) : (
          <Image
            source={icon}
            tintColor={focused ? "#f77b05" : "#a9a9b9"}
            className="size-6"
          />
        )}
        {badge !== undefined && badge > 0 && (
          <View className="absolute -top-1 -right-2 bg-orange-600 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
            <Text className="text-white text-[10px] font-bold">
              {badge > 99 ? "99+" : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        className={`text-base font-semibold ${
          focused ? "text-[#f77b05]" : "text-[#a9a9b9]"
        }`}
      >
        {title}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { cartItemCount } = useStoreStore();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          height: 64,
          width: 100,
          paddingTop: 12,
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingTop: 0,
          height: 64,
          width: "100%",
          overflow: "hidden",
          borderColor: "#0F0D23",
        },
        header: () => <Header />,
      }}
      backBehavior="history"
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          headerShown: false,

          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <FontAwesome5
                  name="home"
                  size={20}
                  color={focused ? "#f77b05" : "#a9a9b9"}
                />
              }
              isIconComponent={true}
              title="Home"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <FontAwesome5
                  name="history"
                  size={20}
                  color={focused ? "#f77b05" : "#a9a9b9"}
                />
              }
              title="Orders"
              isIconComponent={true}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Entypo
                  name="shopping-cart"
                  size={20}
                  color={focused ? "#f77b05" : "#a9a9b9"}
                />
              }
              isIconComponent={true}
              title="Cart"
              badge={cartItemCount}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <FontAwesome
                  name="user"
                  size={20}
                  color={focused ? "#f77b05" : "#a9a9b9"}
                />
              }
              isIconComponent={true}
              title="Profile"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="faq"
        options={{
          title: "FAQ",
          href: null,
        }}
      />

      <Tabs.Screen
        name="contact"
        options={{
          title: "Contact Us",
          href: null,
        }}
      />
    </Tabs>
  );
}
