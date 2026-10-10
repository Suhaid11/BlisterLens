import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CarDetectionResult } from '@/types/car';
import { Colors } from '@/constants/theme';

interface DeveloperJsonInspectorProps {
  result: CarDetectionResult;
  rawJson: string;
  modelUsed: string;
}

export function DeveloperJsonInspector({ result, rawJson, modelUsed }: DeveloperJsonInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleHeader}
        activeOpacity={0.8}
        onPress={() => setIsOpen(!isOpen)}>
        <View style={styles.headerLeft}>
          <View style={styles.statusDot} />
          <Text style={styles.headerTitle}>DEVELOPER INSPECTOR</Text>
          <View style={styles.modelTag}>
            <Text style={styles.modelTagText}>{modelUsed}</Text>
          </View>
        </View>
        <Text style={styles.toggleArrow}>{isOpen ? '▲ HIDE' : '▼ VIEW JSON'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.body}>
          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>CONFIDENCE</Text>
              <Text style={styles.metricValue}>{Math.round(result.confidence * 100)}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>NORMALIZED BBOX</Text>
              <Text style={styles.metricValue}>
                [{result.car_bbox.x}, {result.car_bbox.y}, {result.car_bbox.width}, {result.car_bbox.height}]
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>COLOR HEX</Text>
              <View style={styles.hexChip}>
                <View style={[styles.hexColorSample, { backgroundColor: result.colour_hex }]} />
                <Text style={styles.metricValue}>{result.colour_hex}</Text>
              </View>
            </View>
          </View>

          {/* Pretty Raw JSON Output */}
          <Text style={styles.jsonTitle}>RAW STRUCTURED RESPONSE:</Text>
          <ScrollView horizontal style={styles.scrollX}>
            <Text style={styles.jsonCode}>
              {JSON.stringify(JSON.parse(rawJson || JSON.stringify(result)), null, 2)}
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#111319',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#262A36',
    overflow: 'hidden',
    marginVertical: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#161922',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: 1.2,
  },
  modelTag: {
    backgroundColor: 'rgba(252, 211, 77, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.packaging.racingYellow,
  },
  modelTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.packaging.racingYellow,
  },
  toggleArrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  body: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#20242F',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E222D',
  },
  metricItem: {
    flex: 1,
    minWidth: 90,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F1F5F9',
    fontFamily: 'monospace',
  },
  hexChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hexColorSample: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  jsonTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
  },
  scrollX: {
    backgroundColor: '#0A0C10',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2028',
  },
  jsonCode: {
    color: '#34D399',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});
