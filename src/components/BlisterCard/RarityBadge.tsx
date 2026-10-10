import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RarityLevel } from '@/types/card';
import { RARITY_CONFIG } from '@/constants/rarity';

interface RarityBadgeProps {
  rarity: RarityLevel;
}

export function RarityBadge({ rarity }: RarityBadgeProps) {
  const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG.Common;

  return (
    <View style={[styles.stampContainer, { borderColor: config.accentColor }]}>
      <View style={[styles.stampInner, { backgroundColor: config.badgeBg }]}>
        <View style={styles.stampHeader}>
          <Text style={[styles.stampCode, { color: config.badgeText }]}>{config.stamp}</Text>
          <View style={[styles.stampDot, { backgroundColor: config.accentColor }]} />
        </View>
        <Text style={[styles.badgeText, { color: config.badgeText }]}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stampContainer: {
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    alignSelf: 'flex-start',
  },
  stampInner: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stampHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stampCode: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    opacity: 0.9,
    fontFamily: 'monospace',
  },
  stampDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
