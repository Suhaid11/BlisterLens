import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { BlisterCard } from '@/components/BlisterCard/BlisterCard';
import { Colors } from '@/constants/theme';
import { getActiveCard, setActiveCard, subscribeActiveCard } from '@/lib/cardStore';
import { shareCardSnapshot } from '@/lib/sharing/cardShare';
import { saveCardToStorage, getSavedCardsFromStorage } from '@/lib/storage/cardStorage';
import { BlisterCardData } from '@/types/card';

export default function CardPreviewScreen() {
  const [displayedCard, setDisplayedCard] = useState<BlisterCardData | null>(getActiveCard());

  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const cardRef = useRef<View>(null);

  // Subscribe to real-time active card updates across all screens
  useEffect(() => {
    return subscribeActiveCard((card) => {
      if (card) {
        setDisplayedCard(card);
      }
    });
  }, []);

  // On screen focus: synchronize immediately with active card or restore latest saved card
  useFocusEffect(
    useCallback(() => {
      const current = getActiveCard();
      if (current) {
        setDisplayedCard(current);
      } else {
        getSavedCardsFromStorage().then((saved) => {
          if (saved && saved.length > 0) {
            setActiveCard(saved[0]);
            setDisplayedCard(saved[0]);
          }
        });
      }
    }, [])
  );

  // Update save button state based strictly on exact card ID presence in storage
  useEffect(() => {
    if (!displayedCard) {
      setSaveSuccess(false);
      return;
    }
    getSavedCardsFromStorage().then((saved) => {
      const isAlreadySaved = saved.some((c) => c && c.id === displayedCard.id);
      setSaveSuccess(isAlreadySaved);
    });
  }, [displayedCard?.id]);

  const handleShare = async () => {
    if (!displayedCard) return;
    setSharing(true);
    setFeedbackMsg(null);
    try {
      const success = await shareCardSnapshot(cardRef);
      if (!success) {
        setFeedbackMsg('Card image copied to clipboard');
      }
    } catch {
      setFeedbackMsg('Unable to share card snapshot');
    } finally {
      setSharing(false);
    }
  };

  const handleSaveToShelf = async () => {
    if (!displayedCard) return;
    setSaving(true);
    setFeedbackMsg(null);
    try {
      await saveCardToStorage(displayedCard);
      setSaveSuccess(true);
      setFeedbackMsg('COLLECTIBLE ADDED TO YOUR SHELF');
    } catch {
      setFeedbackMsg('Could not save to shelf');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Text style={styles.backButtonText}>← SCAN</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>COLLECTIBLE PACK</Text>
        <TouchableOpacity style={styles.shelfLink} onPress={() => router.push('/recent')}>
          <Text style={styles.shelfLinkText}>SHELF →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tactile Feedback Banner */}
        {feedbackMsg && (
          <View style={[styles.feedbackBanner, saveSuccess && styles.feedbackSuccess]}>
            <Text style={styles.feedbackText}>{feedbackMsg}</Text>
          </View>
        )}

        {/* If no real card is active: Clean Branded Empty State */}
        {!displayedCard ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCardFrame}>
              <View style={styles.emptyIconCrosshair}>
                <View style={styles.emptyCrossH} />
                <View style={styles.emptyCrossV} />
              </View>
              <Text style={styles.emptyTitle}>NO COLLECTIBLE YET</Text>
              <Text style={styles.emptySubtitle}>
                Scan a vehicle to manufacture your first 1:64 blister card pack.
              </Text>
              <TouchableOpacity
                style={styles.emptyScanBtn}
                onPress={() => router.push('/')}>
                <Text style={styles.emptyScanBtnText}>SCAN CAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Active Real Scanned Card */
          <>
            <View ref={cardRef} collapsable={false} style={styles.cardRenderWrapper}>
              <BlisterCard cardData={displayedCard} />
            </View>

            {/* Action Controls */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, saveSuccess && styles.primaryActionSaved]}
                onPress={handleSaveToShelf}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryActionText}>
                    {saveSuccess ? '✓ SAVED TO SHELF' : 'SAVE TO SHELF'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={handleShare}
                disabled={sharing}>
                {sharing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.secondaryActionText}>SHARE COLLECTIBLE</Text>
                )}
              </TouchableOpacity>

              <View style={styles.bottomNavRow}>
                <TouchableOpacity style={styles.navLinkBtn} onPress={() => router.push('/')}>
                  <Text style={styles.navLinkText}>SCAN ANOTHER CAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navLinkBtn} onPress={() => router.push('/recent')}>
                  <Text style={styles.navLinkText}>VIEW SHELF DISPLAY</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: '#1A1C22',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  topBarTitle: {
    color: '#F8F9FA',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  shelfLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  shelfLinkText: {
    color: Colors.packaging.racingYellow,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  feedbackBanner: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  feedbackSuccess: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  feedbackText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyContainer: {
    width: '100%',
    maxWidth: 390,
    marginTop: 40,
    alignItems: 'center',
  },
  emptyCardFrame: {
    width: '100%',
    backgroundColor: '#FAF7EE',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D8D1BE',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyIconCrosshair: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#A1A1AA',
    backgroundColor: '#F3EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  emptyCrossH: {
    width: 32,
    height: 2,
    backgroundColor: '#A1A1AA',
  },
  emptyCrossV: {
    position: 'absolute',
    height: 32,
    width: 2,
    backgroundColor: '#A1A1AA',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: Colors.packaging.deepInk,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyScanBtn: {
    backgroundColor: Colors.packaging.packagingRed,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.packaging.packagingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyScanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  cardRenderWrapper: {
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 390,
    marginTop: 14,
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: Colors.packaging.packagingRed,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.packaging.packagingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionSaved: {
    backgroundColor: '#15803D',
    shadowColor: '#15803D',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  secondaryActionBtn: {
    backgroundColor: '#232630',
    borderWidth: 1.5,
    borderColor: '#373C4B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#F8F9FA',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  navLinkBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navLinkText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
