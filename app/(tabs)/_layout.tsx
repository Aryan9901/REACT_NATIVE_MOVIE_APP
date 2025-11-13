import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

import Header from "@/components/Header";

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
        <Image source={icon} tintColor="#a9a9b9" className="size-6" />
      )}
      <Text
        style={{ color: "#a9a9b9" }}
        className="text-[#a9a9b9] text-base w-fit font-semibold"
      >
        {title}
      </Text>
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
                  color={focused ? "#f77b05" : "#a9a9b9"}
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
        name="store"
        options={{
          title: "Store",
          href: null,
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
