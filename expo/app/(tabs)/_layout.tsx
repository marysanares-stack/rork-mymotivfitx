import { Tabs } from "expo-router";
import { Home, Activity, Users, User } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarItemStyle: {
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600' as const,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={Math.max(20, (size ?? 24) - 2)} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={Math.max(20, (size ?? 24) - 2)} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Users color={color} size={Math.max(20, (size ?? 24) - 2)} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={Math.max(20, (size ?? 24) - 2)} />,
        }}
      />
    </Tabs>
  );
}
