import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

interface BlisterBubbleProps {
  imageUri?: string | number | any;
  vehicleLabel?: string;
  accentColor?: string;
}

/**
 * Authentic 1990s Die-Cast Molded Plastic Blister Bubble
 * Modeled after Hot Wheels & Matchbox physical packaging:
 * 1. Wide, sleek automotive aspect ratio (fits 1:64 car snugly without dead margins)
 * 2. Realistic thermoformed plastic flange (heat-sealed crimped perimeter lip)
 * 3. Deep molded chamber with internal drop shadows
 * 4. Grounded asphalt stage with contact shadows
 * 5. Multi-angle specular glare & reflection highlights
 * 6. Hero car dominates the chamber from wheel to wheel
 */
export function BlisterBubble({ imageUri, vehicleLabel, accentColor }: BlisterBubbleProps) {
  return (
    <View style={styles.blisterAssembly}>
      {/* Outer Heat-Sealed Plastic Flange Rim (Welded to Cardboard) */}
      <View style={styles.plasticFlangeRim}>
        {/* Thermoformed Clear Plastic Chamber */}
        <View style={styles.moldedBubbleChamber}>
          {/* Chamber Interior Stage & Backdrop */}
          <View style={styles.chamberBackdrop}>
            {/* Speed Grid / Horizon Line */}
            <View style={[styles.horizonPinstripe, { backgroundColor: accentColor || '#DC2626' }]} />
            <View style={styles.gridLineUpper} />
            {/* Die-Cast Asphalt Road Surface */}
            <View style={styles.asphaltRoadBed}>
              <View style={styles.roadCenterStripe} />
            </View>
          </View>

          {/* Hero Vehicle Display */}
          <View style={styles.vehicleStage}>
            {imageUri ? (
              <View style={styles.carFrame}>
                <Image
                  source={typeof imageUri === 'string' ? { uri: imageUri } : imageUri}
                  style={styles.heroVehicleImage}
                  contentFit="contain"
                  priority="high"
                />
                {/* Tire Grounding Shadow beneath wheels */}
                <View style={styles.tireContactGroundShadow} />
              </View>
            ) : (
              <View style={styles.emptyStagePlaceholder}>
                <View style={styles.crosshairTarget}>
                  <View style={styles.crosshairLineH} />
                  <View style={styles.crosshairLineV} />
                </View>
                <Text style={styles.placeholderTitle}>
                  {vehicleLabel ? vehicleLabel.toUpperCase() : 'DIE-CAST VEHICLE'}
                </Text>
                <Text style={styles.placeholderScale}>1:64 SCALE MODEL SPECIFICATION</Text>
              </View>
            )}
          </View>

          {/* Optical Highlights: Clear Molded Plastic Glare */}
          {/* 1. Top Curved Specular Glare Arc */}
          <View style={styles.specularTopArc} />

          {/* 2. Stepped Bevel Edge Highlight (Left & Top Rim) */}
          <View style={styles.plasticBevelHighlight} />

          {/* 3. Diagonal Light Sheen Beam */}
          <View style={styles.diagonalGlareBeam} />

          {/* 4. Bottom Plastic Mold Crease & Shadow */}
          <View style={styles.bottomMoldShadow} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  blisterAssembly: {
    width: '100%',
    marginVertical: 4,
    position: 'relative',
  },
  plasticFlangeRim: {
    // Authentic wide thermoformed plastic flange heat-sealed to cardstock
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
  moldedBubbleChamber: {
    // Molded plastic bubble with proportional 1:64 automotive dimensions
    height: 182,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: '#1E232A',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chamberBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  horizonPinstripe: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    height: 2.5,
    opacity: 0.45,
  },
  gridLineUpper: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  asphaltRoadBed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: '#181B20',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
  },
  roadCenterStripe: {
    width: '100%',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  vehicleStage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carFrame: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  heroVehicleImage: {
    width: '100%',
    height: '100%',
  },
  tireContactGroundShadow: {
    position: 'absolute',
    bottom: 4,
    left: '8%',
    right: '8%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: -1,
  },
  specularTopArc: {
    // Overhead light glare reflecting off curved top edge of thermoformed plastic
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 5,
    pointerEvents: 'none',
  },
  plasticBevelHighlight: {
    // Stepped plastic molding edge reflection
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 5,
    pointerEvents: 'none',
  },
  diagonalGlareBeam: {
    // Iconic diagonal packaging studio glare
    position: 'absolute',
    top: -50,
    left: 35,
    width: 22,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    transform: [{ rotate: '26deg' }],
    zIndex: 5,
    pointerEvents: 'none',
  },
  bottomMoldShadow: {
    // Plastic base cavity shadow
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 4,
    pointerEvents: 'none',
  },
  emptyStagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  crosshairTarget: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#71717A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  crosshairLineH: {
    position: 'absolute',
    width: 32,
    height: 1.5,
    backgroundColor: '#71717A',
  },
  crosshairLineV: {
    position: 'absolute',
    height: 32,
    width: 1.5,
    backgroundColor: '#71717A',
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#E4E4E7',
    letterSpacing: 1.2,
  },
  placeholderScale: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A1A1AA',
    letterSpacing: 1,
    marginTop: 3,
  },
});
