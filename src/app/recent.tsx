import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { BlisterCardData } from '@/types/card';
import { Colors } from '@/constants/theme';
import { RARITY_CONFIG } from '@/constants/rarity';
import { setActiveCard } from '@/lib/cardStore';
import {
  getSavedCardsFromStorage,
  deleteCardFromStorage,
  clearAllSavedCards,
} from '@/lib/storage/cardStorage';

export default function RecentScreen() {
  const [cards, setCards] = useState<BlisterCardData[]>([]);

  const loadCards = async () => {
    try {
      const items = await getSavedCardsFromStorage();
      setCards(items);
    } catch {
      setCards([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const handleSelectCard = (card: BlisterCardData) => {
    setActiveCard(card);
    router.push('/card');
  };

  const handleDeleteSingleCard = async (id: string) => {
    await deleteCardFromStorage(id);
    await loadCards();
  };

  const handleClearShelf = async () => {
    await clearAllSavedCards();
    setCards([]);
  };

  // Derive display count directly from actual saved cards (zero fabricated counts)
  const countLabel =
    cards.length === 0
      ? 'NO CARDS YET'
      : cards.length === 1
      ? '1 CARD ON DISPLAY'
      : `${cards.length} / 12 ON DISPLAY`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Retail Shelf Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerSubtitle}>STREET SHELF ’90</Text>
          <Text style={styles.headerTitle}>COLLECTOR DISPLAY</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{countLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cards.length === 0 ? (
          /* Intentional Empty Shelf State */
          <View style={styles.emptyShelfContainer}>
            <View style={styles.emptyPegboardPlaque}>
              {/* Pegboard Empty Hook Graphic */}
              <View style={styles.emptyHookGraphic}>
                <View style={styles.emptyHookBase} />
                <View style={styles.emptyHookStem} />
              </View>

              <Text style={styles.emptyShelfTitle}>YOUR SHELF IS EMPTY</Text>
              <Text style={styles.emptyShelfSubtitle}>
                Scan your first car to manufacture a 1:64 pocket-sized collectible.
              </Text>

              <TouchableOpacity
                style={styles.emptyScanBtn}
                onPress={() => router.push('/')}>
                <Text style={styles.emptyScanBtnText}>SCAN CAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Populated Shelf with Real Saved Collectibles */
          <>
            <View style={styles.shelfGrid}>
              {cards.map((card, index) => {
                const rarityCfg = RARITY_CONFIG[card.rarity] || RARITY_CONFIG.Common;
                const imgSource = card.cropped_image_uri || card.image_uri;

                return (
                  <View key={card.id || index} style={styles.pegSlot}>
                    {/* Retail Metal J-Hook Peg Hook */}
                    <View style={styles.metalPegHook}>
                      <View style={styles.pegBase} />
                      <View style={styles.pegStem} />
                    </View>

                    {/* Miniature Blister Pack Card */}
                    <TouchableOpacity
                      style={[
                        styles.miniCard,
                        {
                          transform: [
                            { rotate: index % 4 === 1 ? '1deg' : index % 4 === 3 ? '-1deg' : '0deg' },
                          ],
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleSelectCard(card)}>
                      {/* Colored Packaging Header Banner */}
                      <View
                        style={[
                          styles.miniHeaderBanner,
                          { backgroundColor: card.colour_hex || Colors.packaging.packagingRed },
                        ]}>
                        {/* Hanging Euroslot Cutout */}
                        <View style={styles.miniPunchHole}>
                          <View style={styles.miniPunchSlot} />
                        </View>

                        {/* Brand Lockup, Series Number, and Remove Action */}
                        <View style={styles.miniHeaderRow}>
                          <Text style={styles.miniBrandName}>BLISTERLENS</Text>
                          <View style={styles.miniHeaderRight}>
                            <Text style={styles.miniSeriesNum}>
                              {card.series_number || `#${index + 1}`}
                            </Text>
                            <TouchableOpacity
                              style={styles.cardDeleteBtn}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                handleDeleteSingleCard(card.id);
                              }}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              accessibilityLabel="Remove card from shelf">
                              <Text style={styles.cardDeleteBtnText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Cardboard Body */}
                      <View style={styles.miniCardBody}>
                        {/* Molded Blister Bubble */}
                        <View style={styles.miniBlisterDome}>
                          <View style={styles.miniBlisterGlare} />
                          <View style={styles.miniRoadBed} />
                          {imgSource ? (
                            <Image
                              source={typeof imgSource === 'string' ? { uri: imgSource } : imgSource}
                              style={styles.miniCarPhoto}
                              contentFit="contain"
                            />
                          ) : (
                            <View style={styles.emptyMiniSlot} />
                          )}
                        </View>

                        {/* Model Nameplate */}
                        <View style={styles.miniNameplate}>
                          <Text style={styles.miniMakeText}>{card.make.toUpperCase()}</Text>
                          <Text style={styles.miniModelText} numberOfLines={1}>
                            {card.model.toUpperCase()}
                          </Text>
                        </View>

                        {/* Rarity & Scale Footer */}
                        <View style={styles.miniFooter}>
                          <View
                            style={[
                              styles.miniRarityPill,
                              { backgroundColor: rarityCfg.badgeBg },
                            ]}>
                            <Text style={[styles.miniRarityText, { color: rarityCfg.badgeText }]}>
                              {rarityCfg.label}
                            </Text>
                          </View>
                          <Text style={styles.miniScaleText}>1:64</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Shelf Actions */}
            <View style={styles.actionsFooter}>
              <TouchableOpacity
                style={styles.scanMoreBtn}
                onPress={() => router.push('/')}>
                <Text style={styles.scanMoreBtnText}>+ SCAN ANOTHER VEHICLE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearShelfBtn}
                onPress={handleClearShelf}>
                <Text style={styles.clearShelfBtnText}>CLEAR SHELF</Text>
              </TouchableOpacity>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1A1C22',
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  headerTitle: {
    color: '#F8F9FA',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: '#262933',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#373C4B',
  },
  countBadgeText: {
    color: Colors.packaging.racingYellow,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyShelfContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  emptyPegboardPlaque: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FAF7EE',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D8D1BE',
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyHookGraphic: {
    width: 24,
    height: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyHookBase: {
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  emptyHookStem: {
    width: 6,
    height: 18,
    backgroundColor: '#94A3B8',
    borderRadius: 3,
  },
  emptyShelfTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: Colors.packaging.deepInk,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyShelfSubtitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  emptyScanBtn: {
    backgroundColor: Colors.packaging.packagingRed,
    paddingVertical: 14,
    paddingHorizontal: 40,
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
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  pegSlot: {
    width: '47%',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  metalPegHook: {
    width: 20,
    height: 18,
    alignItems: 'center',
    position: 'relative',
    zIndex: 10,
    marginBottom: -8,
  },
  pegBase: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#475569',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  pegStem: {
    width: 5,
    height: 12,
    backgroundColor: '#94A3B8',
    borderRadius: 2.5,
  },
  miniCard: {
    width: '100%',
    backgroundColor: Colors.packaging.cardboard,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: Colors.packaging.cardboardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  miniHeaderBanner: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  miniPunchHole: {
    alignItems: 'center',
    marginBottom: 3,
  },
  miniPunchSlot: {
    width: 26,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16171B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  miniHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  miniBrandName: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  miniSeriesNum: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FEF08A',
  },
  cardDeleteBtn: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  miniCardBody: {
    padding: 7,
  },
  miniBlisterDome: {
    height: 92,
    backgroundColor: '#1E232A',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniBlisterGlare: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    zIndex: 2,
  },
  miniRoadBed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#14171C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  miniCarPhoto: {
    width: '100%',
    height: '100%',
  },
  emptyMiniSlot: {
    width: '100%',
    height: '100%',
    backgroundColor: '#262933',
  },
  miniNameplate: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  miniMakeText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#78716C',
  },
  miniModelText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.4,
    color: Colors.packaging.deepInk,
  },
  miniFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniRarityPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
  },
  miniRarityText: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  miniScaleText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#78716C',
  },
  actionsFooter: {
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
  },
  scanMoreBtn: {
    width: '100%',
    maxWidth: 390,
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
  scanMoreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  clearShelfBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearShelfBtnText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
