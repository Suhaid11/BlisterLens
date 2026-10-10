import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Top3Match } from '@/types/car';
import { Colors } from '@/constants/theme';

interface LowConfidenceConfirmationProps {
  confidence: number;
  top3: Top3Match[];
  initialMake: string;
  initialModel: string;
  onConfirm: (selected: { make: string; model: string }) => void;
}

export function LowConfidenceConfirmation({
  confidence,
  top3,
  initialMake,
  initialModel,
  onConfirm,
}: LowConfidenceConfirmationProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Fallback candidates if top3 is sparse
  const candidates = top3 && top3.length > 0
    ? top3
    : [{ make: initialMake, model: initialModel, confidence }];

  const handleConfirm = () => {
    const chosen = candidates[selectedIdx] || candidates[0];
    onConfirm({ make: chosen.make, model: chosen.model });
  };

  return (
    <View style={styles.container}>
      {/* Warning Header */}
      <View style={styles.header}>
        <View style={styles.cautionBadge}>
          <Text style={styles.cautionBadgeText}>COLLECTOR VERIFICATION</Text>
        </View>
        <Text style={styles.title}>WE'RE NOT FULLY SURE</Text>
        <Text style={styles.subtitle}>
          Which vehicle looks right for your collectible?
        </Text>
      </View>

      {/* Candidate List */}
      <View style={styles.candidatesList}>
        {candidates.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          const pct = Math.round(item.confidence * 100);

          return (
            <TouchableOpacity
              key={`${item.make}-${item.model}-${idx}`}
              style={[styles.candidateCard, isSelected && styles.candidateCardSelected]}
              activeOpacity={0.8}
              onPress={() => setSelectedIdx(idx)}>
              {/* Radio Indicator */}
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>

              {/* Vehicle Title & Bar */}
              <View style={styles.candidateInfo}>
                <View style={styles.candidateHeader}>
                  <Text style={[styles.candidateTitle, isSelected && styles.candidateTitleSelected]}>
                    {idx + 1}. {item.make} {item.model}
                  </Text>
                  <Text style={[styles.candidatePct, isSelected && styles.candidatePctSelected]}>
                    {pct}%
                  </Text>
                </View>

                {/* Visual Confidence Bar */}
                <View style={styles.confidenceTrack}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${Math.max(8, pct)}%`,
                        backgroundColor: isSelected ? Colors.packaging.racingYellow : '#4B5563',
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={styles.confirmButton}
        activeOpacity={0.85}
        onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>CONFIRM VEHICLE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E1710',
    borderColor: '#F59E0B',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    marginBottom: 14,
  },
  cautionBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  cautionBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#FDE68A',
    lineHeight: 16,
    marginTop: 4,
  },
  candidatesList: {
    gap: 8,
    marginBottom: 14,
  },
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16120D',
    borderWidth: 1.5,
    borderColor: '#452D12',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  candidateCardSelected: {
    backgroundColor: '#2A1F11',
    borderColor: '#FBBF24',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FBBF24',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FBBF24',
  },
  candidateInfo: {
    flex: 1,
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  candidateTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D1D5DB',
  },
  candidateTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  candidatePct: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  candidatePctSelected: {
    color: '#FBBF24',
    fontWeight: '900',
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: '#2D2012',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confirmButton: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
});
