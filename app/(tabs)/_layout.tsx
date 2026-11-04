import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRightLeftIcon,
  LayoutDashboardIcon,
  PieChartIcon,
  SparklesIcon,
  WalletIcon,
} from 'lucide-react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme !== 'light';

  const activeColor = isDark ? '#00d494' : '#047857';
  const inactiveColor = isDark ? '#7c8ea1' : '#64748b';
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark ? '#0e141d' : '#ffffff',
          borderTopColor: isDark ? '#1a2332' : '#e2e8f0',
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingTop: 6,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <LayoutDashboardIcon color={color} size={20} />
              {focused ? (
                <View
                  style={{ backgroundColor: activeColor }}
                  className="mt-1 h-1 w-1 rounded-full"
                />
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <ArrowRightLeftIcon color={color} size={20} />
              {focused ? (
                <View
                  style={{ backgroundColor: activeColor }}
                  className="mt-1 h-1 w-1 rounded-full"
                />
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planejador',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <SparklesIcon color={color} size={20} />
              {focused ? (
                <View
                  style={{ backgroundColor: activeColor }}
                  className="mt-1 h-1 w-1 rounded-full"
                />
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Orçamentos',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <PieChartIcon color={color} size={20} />
              {focused ? (
                <View
                  style={{ backgroundColor: activeColor }}
                  className="mt-1 h-1 w-1 rounded-full"
                />
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center">
              <WalletIcon color={color} size={20} />
              {focused ? (
                <View
                  style={{ backgroundColor: activeColor }}
                  className="mt-1 h-1 w-1 rounded-full"
                />
              ) : null}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
