import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showWordmark?: boolean;
  lightMode?: boolean;
}

/**
 * Authentic Die-Cast Collectible Brand Emblem
 * Designed via @logo-design principles:
 * - Bold aerodynamic racing shield badge with metallic gold chamfer
 * - Twin forward-thrusting speed chevrons
 * - Crystalline central blister window with convex lens specular highlight
 * - Immediately recognizable as an automotive collectible brand mark even without text
 */
export function BrandLogo({ size = 'medium', showWordmark = true, lightMode = false }: BrandLogoProps) {
  const iconDim = size === 'small' ? 32 : size === 'medium' ? 44 : 56;
  const textColor = lightMode ? Colors.packaging.deepInk : Colors.dark.text;

  return (
    <View style={styles.container}>
      {/* Aerodynamic Die-Cast Shield Emblem */}
      <View
        style={[
          styles.shieldBadge,
          {
            width: iconDim,
            height: iconDim,
            borderRadius: iconDim * 0.28,
          },
        ]}>
        {/* Outer Metallic Gold Chamfer Edge */}
        <View style={styles.goldChamferRim} />

        {/* Top Specular Foil Reflection */}
        <View style={styles.specularFoilArc} />

        {/* Dynamic Twin Racing Speed Wings */}
        <View style={styles.speedWingsContainer}>
          <View style={styles.speedWingLeft} />
          <View style={styles.speedWingRight} />
        </View>

        {/* Central Crystalline Blister Capsule Core */}
        <View
          style={[
            styles.blisterCapsule,
            {
              width: iconDim * 0.48,
              height: iconDim * 0.48,
              borderRadius: (iconDim * 0.48) / 2,
            },
          ]}>
          <View style={styles.lensReflectionPoint} />
          <View style={styles.innerSpeedCore} />
        </View>
      </View>

      {showWordmark && (
        <View style={styles.wordmarkContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: textColor }]}>BLISTER</Text>
            <Text style={styles.titleAccent}>LENS</Text>
          </View>
          <Text style={styles.tagline}>STREET SHELF ’90 • POCKET COLLECTIBLE</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldBadge: {
    backgroundColor: '#DC2626', // Deep racing crimson enamel
    borderWidth: 2.5,
    borderColor: '#F59E0B', // Rich metallic gold trim
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  goldChamferRim: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  specularFoilArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  speedWingsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '84%',
    zIndex: 2,
  },
  speedWingLeft: {
    width: 7,
    height: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
    transform: [{ rotate: '30deg' }],
  },
  speedWingRight: {
    width: 7,
    height: 3,
    backgroundColor: '#F59E0B',
    borderRadius: 1.5,
    transform: [{ rotate: '-30deg' }],
  },
  blisterCapsule: {
    backgroundColor: '#0F1115',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 3,
  },
  lensReflectionPoint: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  innerSpeedCore: {
    width: '45%',
    height: 2,
    backgroundColor: '#DC2626',
    borderRadius: 1,
    transform: [{ rotate: '-28deg' }],
  },
  wordmarkContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  titleAccent: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#DC2626',
    marginLeft: 3,
  },
  tagline: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
