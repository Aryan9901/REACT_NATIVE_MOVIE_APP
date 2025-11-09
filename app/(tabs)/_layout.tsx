import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

import Header from "@/components/Header";
import { icons } from "@/constants/icons";

function TabIcon({ focused, icon, title, isIconComponent }: any) {
  if (focused) {
    return (
      <View className="size-full flex gap-1 justify-center items-center mt-4 min-w-20 rounded-full">
        {isIconComponent ? (
          icon
        ) : (
          <Image source={icon} tintColor="#f77b05" className="size-6" />
        )}
        <Text className="text-[#f77b05] text-base w-fit font-semibold">
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View className="size-full flex gap-1 justify-center items-center mt-4 min-w-20 rounded-full">
      {isIconComponent ? (
        icon
      ) : (
        <Image source={icon} tintColor="#333" className="size-6" />
      )}
      <Text className="text-[#333] text-base w-fit font-semibold">{title}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingTop: 2,
          height: 64,
          overflow: "hidden",
          borderColor: "#0F0D23",
        },
        header: () => <Header />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <FontAwesome5
                  name="history"
                  size={20}
                  color={focused ? "#f77b05" : "#333"}
                />
              }
              title="Orders"
              isIconComponent={true}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={
                <Entypo
                  name="shopping-cart"
                  size={20}
                  color={focused ? "#f77b05" : "#333"}
                />
              }
              isIconComponent={true}
              title="Cart"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
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
