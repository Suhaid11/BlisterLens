import React from 'react';
import { View, StyleSheet } from 'react-native';

export function EuroPunchHole() {
  return (
    <View style={styles.container}>
      {/* Outer die-cut rim */}
      <View style={styles.outerRim}>
        {/* Main circular top cutout */}
        <View style={styles.centerCircle} />
        {/* Horizontal slot extensions (the classic Euroslot keyhole/sombrero shape) */}
        <View style={styles.horizontalSlot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  outerRim: {
    width: 64,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#0F1014',
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 2,
  },
  centerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0A0A0D',
    position: 'absolute',
    top: -3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  horizontalSlot: {
    width: 50,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0A0A0D',
    position: 'absolute',
    bottom: 2,
  },
});
