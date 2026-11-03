import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import {
  ArrowRightLeftIcon,
  BrainCircuitIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  PieChartIcon,
} from 'lucide-react-native';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#00d494' : '#047857',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: isDark ? '#0e141d' : '#ffffff',
          borderTopColor: isDark ? '#1a2332' : '#e2e8f0',
          borderTopWidth: 1,
          height: 62,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => <LayoutDashboardIcon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size }) => <ArrowRightLeftIcon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'IA / GA',
          tabBarIcon: ({ color, size }) => <BrainCircuitIcon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Orçamentos',
          tabBarIcon: ({ color, size }) => <PieChartIcon color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color, size }) => <LandmarkIcon color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
