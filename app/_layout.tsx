import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { AppProvider, useApp } from '@/context/AppContext';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/text';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

function NavigationGate() {
  const { isAuthenticated, isLoadingAuth } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoadingAuth) return;

    const inAuthScreen = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthScreen) {
      router.replace('/auth');
    } else if (isAuthenticated && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoadingAuth, segments, router]);

  if (isLoadingAuth) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <ActivityIndicator size="large" color="#00d494" />
        <Text className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Iniciando Rumvel Banking...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme('dark');
    }
  }, [colorScheme, setColorScheme]);

  return (
    <AppProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'dark']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <NavigationGate />
        <PortalHost />
      </ThemeProvider>
    </AppProvider>
  );
}
