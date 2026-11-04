import React from 'react';
import { Redirect } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function Index() {
  const { isAuthenticated, isLoadingAuth } = useApp();
  if (isLoadingAuth) return null;
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/auth'} />;
}
