import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getPackagingAccentsForCar } from '@/constants/theme';
import { BlisterCardData, RarityLevel } from '@/types/card';
import { BlisterBubble } from './BlisterBubble';
import { RarityBadge } from './RarityBadge';

interface BlisterCardProps {
  cardData?: BlisterCardData;
  make?: string;
  model?: string;
  variant?: string;
  colour_name?: string;
  colour_hex?: string;
  rarity?: RarityLevel;
  imageUri?: string | number | any;
  series_number?: string;
}

/**
 * Authentic 1990s Die-Cast Blister Packaging Card
 * Grounded directly in vintage Hot Wheels & Matchbox physical retail packaging:
 * 1. Clay-coated cardboard backing with die-cut perimeter
 * 2. High-energy saturated printed header banner in vehicle livery color
 * 3. Authentic Euroslot pegboard hanging punch with cavity shadow
 * 4. Distinct die-cast brand identity & collector numbering
 * 5. Thermoformed clear plastic blister with full-frame hero car
 * 6. High-impact printed automotive nameplate & foil rarity seal
 * 7. Packaging safety notices & printed retail barcode
 */
export function BlisterCard(props: BlisterCardProps) {
  const card = props.cardData;
  const make = card?.make ?? props.make ?? '';
  const model = card?.model ?? props.model ?? '';
  const variant = card?.variant ?? props.variant;
  const colour_name = card?.colour_name ?? props.colour_name ?? 'Original Paint';
  const colour_hex = card?.colour_hex ?? props.colour_hex ?? '#DC2626';
  const rarity: RarityLevel = (card?.rarity as RarityLevel) ?? props.rarity ?? 'Rare';
  const imageUri = card?.cropped_image_uri ?? card?.image_uri ?? props.imageUri;
  const series_number = card?.series_number ?? props.series_number ?? '01 / 12';
  const displayImageUri = imageUri;

  // Dynamic packaging livery palette based on vehicle paint with mathematical contrast guarantee
  const packagingAccents = React.useMemo(() => {
    return getPackagingAccentsForCar(colour_hex, colour_name);
  }, [colour_hex, colour_name]);

  // Dynamic typography sizing for hero vehicle name
  const modelFontSize = model.length > 16 ? 22 : model.length > 11 ? 25 : 29;
  const modelLineHeight = model.length > 16 ? 25 : model.length > 11 ? 28 : 32;

  return (
    <View style={styles.packagingShell}>
      {/* Heavyweight Clay-Coated Cardboard Substrate */}
      <View style={styles.cardboardBody}>
        {/* TOP PRINTED HEADER BANNER (Full-Bleed Saturated Livery) */}
        <View style={[styles.headerBanner, { backgroundColor: packagingAccents.bannerBg }]}>
          {/* Top CMYK Registration Mark & Spec Number */}
          <View style={styles.registrationBar}>
            <View style={styles.cmykDots}>
              <View style={[styles.dot, { backgroundColor: '#00AEEF' }]} />
              <View style={[styles.dot, { backgroundColor: '#EC008C' }]} />
              <View style={[styles.dot, { backgroundColor: '#FFF200' }]} />
              <View style={[styles.dot, { backgroundColor: '#000000' }]} />
            </View>
            <Text style={[styles.registrationCode, { color: packagingAccents.registrationCodeColor }]}>
              REG. 90-BL-SPEC
            </Text>
          </View>

          {/* Authentic Euroslot Pegboard Hanging Punch */}
          <View style={styles.euroslotPunch}>
            <View style={styles.euroslotNotch} />
            <View style={styles.euroslotCavityShadow} />
          </View>

          {/* Header Brand Lockup & Collector Number */}
          <View style={styles.headerContentRow}>
            {/* Brand Title Lockup */}
            <View style={styles.brandLockup}>
              <View style={styles.brandTitleRow}>
                <View style={styles.brandWingIcon}>
                  <View style={styles.wingSlash} />
                </View>
                <Text style={[styles.brandTitleText, { color: packagingAccents.brandTitleColor }]}>
                  BLISTER
                </Text>
                <Text style={[styles.brandTitleAccent, { color: packagingAccents.brandAccentColor }]}>
                  LENS
                </Text>
              </View>
              <Text style={[styles.seriesSubtitle, { color: packagingAccents.seriesSubtitleColor }]}>
                STREET SHELF ’90 • DIE-CAST SERIES
              </Text>
            </View>

            {/* Collector Number Badge Plate */}
            <View style={styles.collectorBadgePlate}>
              <Text style={styles.collectorBadgeLabel}>COLLECTOR NO.</Text>
              <Text style={styles.collectorBadgeNumber}>{series_number}</Text>
            </View>
          </View>

          {/* Header Bottom Racing Pinstripe */}
          <View style={[styles.headerPinstripe, { backgroundColor: packagingAccents.pinstripe }]} />
        </View>

        {/* MID-CARD PACKAGING BODY (Direct Litho Print on Cardboard) */}
        <View style={styles.cardBodyContent}>
          {/* Vehicle Paint & Make Sub-Banner */}
          <View style={styles.subBannerRow}>
            <View style={styles.makePill}>
              <Text style={styles.makePillText}>{make.toUpperCase()}</Text>
            </View>
            <View style={styles.paintChipPill}>
              <View style={[styles.paintColorDot, { backgroundColor: colour_hex || '#DC2626' }]} />
              <Text style={styles.paintChipText}>{colour_name.toUpperCase()}</Text>
            </View>
          </View>

          {/* Thermoformed Molded Clear Plastic Blister Bubble */}
          <BlisterBubble
            imageUri={displayImageUri}
            vehicleLabel={`${make} ${model}`}
            accentColor={packagingAccents.bannerBg}
          />

          {/* HERO AUTOMOTIVE NAMEPLATE */}
          <View style={styles.nameplateBlock}>
            <View style={styles.nameplateMain}>
              <View style={styles.nameplateTitles}>
                <Text style={styles.makeLabelText}>{make.toUpperCase()}</Text>
                <Text
                  style={[
                    styles.heroModelTitle,
                    { fontSize: modelFontSize, lineHeight: modelLineHeight },
                  ]}
                  numberOfLines={2}
                >
                  {model.toUpperCase()}
                </Text>
                {variant ? (
                  <Text style={styles.variantSubtitle} numberOfLines={2}>
                    {variant.toUpperCase()}
                  </Text>
                ) : null}
              </View>

              {/* Rarity Seal & Scale Badge */}
              <View style={styles.raritySealBlock}>
                <RarityBadge rarity={rarity} />
                <View style={styles.scaleBadge}>
                  <Text style={styles.scaleBadgeText}>1:64 SCALE</Text>
                </View>
              </View>
            </View>
          </View>

          {/* CARD FOOTER: RETAIL BARCODE & SAFETY COPY */}
          <View style={styles.cardFooter}>
            <View style={styles.safetyCopyBlock}>
              <Text style={styles.safetyAgesText}>
                AGES 4 & UP • DIE-CAST METAL WITH PLASTIC PARTS
              </Text>
              <Text style={styles.safetyWarningMicro}>
                CHOKING HAZARD — SMALL PARTS. NOT FOR CHILDREN UNDER 3 YEARS.
              </Text>
            </View>

            {/* Micro Barcode */}
            <View style={styles.barcodeLockup}>
              <View style={styles.barcodeBars}>
                <View style={[styles.bar, { width: 2 }]} />
                <View style={[styles.bar, { width: 1 }]} />
                <View style={[styles.bar, { width: 3 }]} />
                <View style={[styles.bar, { width: 1 }]} />
                <View style={[styles.bar, { width: 2 }]} />
                <View style={[styles.bar, { width: 4 }]} />
                <View style={[styles.bar, { width: 1 }]} />
                <View style={[styles.bar, { width: 2 }]} />
                <View style={[styles.bar, { width: 3 }]} />
              </View>
              <Text style={styles.barcodeSerial}>
                90-BL-{(series_number || '0512').replace(/[^0-9]/g, '')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  packagingShell: {
    width: '100%',
    maxWidth: 386,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 16,
    marginVertical: 8,
  },
  cardboardBody: {
    backgroundColor: '#FAF7EE', // Authentic warm clay-coated cardstock
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#D8D1BE', // Heavy die-cut perimeter border
    position: 'relative',
    overflow: 'hidden',
  },
  headerBanner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    position: 'relative',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  registrationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cmykDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
  },
  registrationCode: {
    fontSize: 6.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.6,
    fontFamily: 'monospace',
  },
  euroslotPunch: {
    // Authentic die-cut Euroslot hanging punch in center-top
    alignSelf: 'center',
    width: 62,
    height: 18,
    backgroundColor: '#0F1115', // Cutout shows store pegboard background
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    position: 'relative',
    marginVertical: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  euroslotNotch: {
    width: 22,
    height: 7,
    backgroundColor: '#0F1115',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: -5,
  },
  euroslotCavityShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  headerContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  brandLockup: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandWingIcon: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wingSlash: {
    width: 8,
    height: 2,
    backgroundColor: '#000000',
    transform: [{ rotate: '-25deg' }],
  },
  brandTitleText: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#FFFFFF',
  },
  brandTitleAccent: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#FCD34D',
    marginLeft: 3,
  },
  seriesSubtitle: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  collectorBadgePlate: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1.5,
    borderColor: '#D8D1BE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  collectorBadgeLabel: {
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#71717A',
  },
  collectorBadgeNumber: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: Colors.packaging.deepInk,
  },
  headerPinstripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    opacity: 0.8,
  },
  cardBodyContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
  },
  subBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  makePill: {
    backgroundColor: '#1E232A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  makePillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    color: '#FFFFFF',
  },
  paintChipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: '#D8D1BE',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  paintColorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
  },
  paintChipText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: Colors.packaging.deepInk,
  },
  nameplateBlock: {
    paddingVertical: 6,
    marginTop: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  nameplateMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameplateTitles: {
    flex: 1,
    paddingRight: 8,
  },
  makeLabelText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: '#71717A',
  },
  heroModelTitle: {
    fontWeight: '900',
    letterSpacing: 0.6,
    color: Colors.packaging.deepInk,
    marginVertical: 1,
  },
  variantSubtitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: Colors.packaging.packagingBlue,
  },
  raritySealBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  scaleBadge: {
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: '#D8D1BE',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scaleBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#71717A',
    letterSpacing: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    paddingTop: 6,
  },
  safetyCopyBlock: {
    flex: 1,
    paddingRight: 10,
  },
  safetyAgesText: {
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: Colors.packaging.deepInk,
  },
  safetyWarningMicro: {
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#71717A',
    marginTop: 1,
  },
  barcodeLockup: {
    alignItems: 'flex-end',
  },
  barcodeBars: {
    flexDirection: 'row',
    height: 18,
    alignItems: 'stretch',
    gap: 1.5,
    backgroundColor: '#FAF7EE',
  },
  bar: {
    backgroundColor: Colors.packaging.deepInk,
  },
  barcodeSerial: {
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#71717A',
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
