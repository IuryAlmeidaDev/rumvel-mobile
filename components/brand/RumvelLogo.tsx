import React from 'react';
import { Image, View, type ViewStyle } from 'react-native';
import { useColorScheme } from 'nativewind';
import { cn } from '@/lib/utils';

const emblemLight = require('../../assets/images/emblem-light.png');
const emblemDark = require('../../assets/images/emblem-dark.png');
const faviconWalking = require('../../assets/images/favicon-walking.png');

export interface RumvelLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  style?: ViewStyle;
}

const SIZE_WIDTHS: Record<NonNullable<RumvelLogoProps['size']>, number> = {
  xs: 68,
  sm: 88,
  md: 112,
  lg: 144,
  xl: 176,
};

const SYMBOL_SIZES: Record<NonNullable<RumvelLogoProps['size']>, number> = {
  xs: 28,
  sm: 34,
  md: 42,
  lg: 52,
  xl: 64,
};

/**
 * Arte original aprovada 03 Emblema (texugo-do-mel caminhando acima do lettering "rumvel")
 * com variantes clara e escura idênticas ao Rumvel Web.
 */
export function RumvelLogo({
  size = 'md',
  showText = true,
  className,
  style,
}: RumvelLogoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';

  if (!showText) {
    const dim = SYMBOL_SIZES[size];
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel="Rumvel"
        className={cn('items-center justify-center', className)}
        style={[{ width: dim, height: Math.round(dim * 0.72) }, style]}>
        <Image
          source={faviconWalking}
          style={{ width: dim, height: Math.round(dim * 0.72) }}
          resizeMode="contain"
        />
      </View>
    );
  }

  const width = SIZE_WIDTHS[size];
  // Original artwork is 365x280
  const height = Math.round((width * 280) / 365);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Rumvel"
      className={cn('items-center justify-center', className)}
      style={[{ width, height }, style]}>
      <Image
        source={isDark ? emblemDark : emblemLight}
        style={{ width, height }}
        resizeMode="contain"
      />
    </View>
  );
}
