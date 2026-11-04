import React from 'react';
import { Image, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { ShieldCheckIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const companionSaver = require('../../assets/images/companion-saver.png');

export interface RumvelShowcaseProps {
  compact?: boolean;
  className?: string;
}

/**
 * Painel editorial com o mascote Companheiro guardando uma moeda no pote de economias,
 * compartilhado pelo login e cadastro, idêntico ao RumvelShowcase do site oficial.
 */
export function RumvelShowcase({ compact = false, className }: RumvelShowcaseProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme !== 'light';

  // Exact tokens from Front-Monvix/src/styles/app.css (.rumvel-companion)
  const surfaceBg = isDark ? '#253d2c' : '#e8eedc';
  const inkColor = isDark ? '#f0f5e5' : '#263d2e';
  const mutedColor = isDark ? '#c1cfb7' : '#53654e';
  const discColor = isDark ? '#344c32' : '#dae4c7';
  const borderInk = isDark ? 'rgba(240, 245, 229, 0.16)' : 'rgba(38, 61, 46, 0.16)';
  const badgeBg = isDark ? 'rgba(240, 245, 229, 0.12)' : 'rgba(38, 61, 46, 0.12)';
  const badgeBorder = isDark ? 'rgba(240, 245, 229, 0.18)' : 'rgba(38, 61, 46, 0.18)';

  const imgWidth = compact ? 180 : 220;
  const imgHeight = compact ? 250 : 300;
  const discSize = compact ? 190 : 230;

  return (
    <View
      accessible
      accessibilityLabel="Seu companheiro Rumvel"
      style={{ backgroundColor: surfaceBg }}
      className={cn('justify-between overflow-hidden px-6 pb-6 pt-7', className)}>
      {/* Copy Header */}
      <View>
        <Text
          style={{ color: inkColor, letterSpacing: -0.6 }}
          className="text-2xl font-bold leading-tight">
          {'Rumvel,\no texugo das finanças.'}
        </Text>
        <Text
          style={{ color: mutedColor }}
          className="mt-3 text-sm leading-relaxed">
          {'Um plano que respeita sua vida.\nUm companheiro para seguir em frente.'}
        </Text>
      </View>

      {/* Mascot Scene with Disc and Flipped Mascot (matching scaleX(-1) from web CSS) */}
      <View
        className="my-4 items-center justify-center"
        style={{ minHeight: compact ? 240 : 285 }}>
        <View
          style={{
            width: discSize,
            height: discSize,
            borderRadius: discSize / 2,
            backgroundColor: discColor,
            position: 'absolute',
          }}
        />
        <Image
          source={companionSaver}
          accessibilityLabel="Rumvel, o texugo das finanças, guardando uma moeda em seu pote de economias."
          style={{
            width: imgWidth,
            height: imgHeight,
            transform: [{ scaleX: -1 }],
          }}
          resizeMode="contain"
        />
      </View>

      {/* Footer Banner */}
      <View
        style={{ borderTopColor: borderInk, borderTopWidth: 1 }}
        className="flex-row items-center gap-3.5 pt-4">
        <View
          style={{
            backgroundColor: badgeBg,
            borderColor: badgeBorder,
            borderWidth: 1,
          }}
          className="h-9 w-9 items-center justify-center rounded-[10px]">
          <ShieldCheckIcon size={17} color={inkColor} />
        </View>
        <Text style={{ color: mutedColor }} className="flex-1 text-xs leading-relaxed">
          {'O essencial protegido.\n'}
          <Text style={{ color: inkColor }} className="text-xs font-semibold">
            O seu próximo passo, mais claro.
          </Text>
        </Text>
      </View>
    </View>
  );
}
