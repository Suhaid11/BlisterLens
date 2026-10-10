import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BrandLogo } from '@/components/BrandLogo';
import { LowConfidenceConfirmation } from '@/components/LowConfidenceConfirmation';
import {
  capturePhotoFromCamera,
  pickPhotoFromGallery,
  ProcessedImage,
  cropVehicleFromImage,
  generateSeriesNumber,
} from '@/lib/image/imagePipeline';
import {
  identifyCarFromImage,
  GeminiAnalysisResponse,
} from '@/lib/gemini/client';
import { calculateRarity } from '@/constants/rarity';
import { setActiveCard } from '@/lib/cardStore';

export default function ScanScreen() {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResponse | null>(null);
  const [confirmedMatch, setConfirmedMatch] = useState<{ make: string; model: string } | null>(null);

  const router = useRouter();

  const handleConfirmLowConfidence = (chosen: { make: string; model: string }) => {
    if (!analysisResult || !processedImage) return;

    setConfirmedMatch(chosen);

    const rarity = calculateRarity(
      chosen.make,
      chosen.model,
      analysisResult.result.colour_name
    );

    const seriesNumber = generateSeriesNumber(chosen.make, chosen.model);

    setActiveCard({
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      make: chosen.make,
      model: chosen.model,
      variant: analysisResult.result.variant,
      colour_name: analysisResult.result.colour_name,
      colour_hex: analysisResult.result.colour_hex,
      rarity,
      series_number: seriesNumber,
      series_name: 'STREET SHELF ’90',
      image_uri: processedImage.uri,
      cropped_image_uri: processedImage.uri,
      timestamp: Date.now(),
    });
  };

  const handleProcessImage = async (imagePromise: Promise<ProcessedImage | null>) => {
    setErrorMsg(null);
    setConfirmedMatch(null);
    try {
      setLoading(true);
      setLoadingStep('SCANNING VEHICLE...');

      const img = await imagePromise;
      if (!img) {
        setLoading(false);
        return;
      }

      setProcessedImage(img);
      setLoadingStep('IDENTIFYING MAKE & MODEL...');

      const response = await identifyCarFromImage(img.base64);
      setAnalysisResult(response);

      setLoadingStep('FRAMING DIE-CAST BLISTER...');
      const croppedUri = await cropVehicleFromImage(
        img.uri,
        img.width,
        img.height,
        response.result.car_bbox
      );

      setLoadingStep('PACKAGING COLLECTIBLE...');

      const rarity = calculateRarity(
        response.result.make,
        response.result.model,
        response.result.colour_name
      );

      const seriesNumber = generateSeriesNumber(response.result.make, response.result.model);

      setActiveCard({
        id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        make: response.result.make,
        model: response.result.model,
        variant: response.result.variant,
        colour_name: response.result.colour_name,
        colour_hex: response.result.colour_hex,
        rarity,
        series_number: seriesNumber,
        series_name: 'STREET SHELF ’90',
        image_uri: img.uri,
        cropped_image_uri: croppedUri || img.uri,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not analyze vehicle. Please try another angle.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleCreateCollectible = () => {
    router.push('/card');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <BrandLogo size="medium" />
        </View>

        {/* STATE A: VEHICLE IDENTIFIED (RESULT STATE) */}
        {analysisResult && !loading ? (
          <View style={styles.resultViewContainer}>
            {/* Collector Identification Plaque */}
            <View style={styles.editorialResultCard}>
              <View style={styles.resultHeaderPill}>
                <Text style={styles.resultBadge}>★ VEHICLE IDENTIFIED ★</Text>
              </View>

              {/* Collector Specimen Frame with Captured Photo */}
              <View style={styles.specimenPhotoFrame}>
                {processedImage ? (
                  <Image
                    source={{ uri: processedImage.uri }}
                    style={styles.specimenImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.specimenBlank}>
                    <Text style={styles.specimenBlankText}>1:64 SPECIMEN</Text>
                  </View>
                )}
                {/* Viewport Corner Marks */}
                <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
                <View style={[styles.cornerBracket, styles.bracketTopRight]} />
                <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
                <View style={[styles.cornerBracket, styles.bracketBottomRight]} />
              </View>

              {analysisResult.result.confidence < 0.6 && !confirmedMatch ? (
                <LowConfidenceConfirmation
                  initialMake={analysisResult.result.make}
                  initialModel={analysisResult.result.model}
                  confidence={analysisResult.result.confidence}
                  top3={analysisResult.result.top3 || []}
                  onConfirm={handleConfirmLowConfidence}
                />
              ) : (
                <View style={styles.matchIdentifiedSection}>
                  <Text style={styles.resultMake}>
                    {(confirmedMatch?.make || analysisResult.result.make).toUpperCase()}
                  </Text>
                  <Text style={styles.resultModel}>
                    {(confirmedMatch?.model || analysisResult.result.model).toUpperCase()}
                  </Text>
                  {analysisResult.result.variant ? (
                    <Text style={styles.resultVariant}>
                      {analysisResult.result.variant.toUpperCase()}
                    </Text>
                  ) : null}
                  <Text style={styles.resultColor}>
                    {analysisResult.result.colour_name.toUpperCase()} •{' '}
                    {Math.round(
                      (confirmedMatch ? 0.98 : analysisResult.result.confidence) * 100
                    )}
                    % MATCH • 1:64 DIE-CAST
                  </Text>

                  {/* Primary CTA */}
                  <TouchableOpacity
                    style={styles.createCollectibleBtn}
                    onPress={handleCreateCollectible}>
                    <Text style={styles.createCollectibleBtnText}>
                      CREATE COLLECTIBLE PACK →
                    </Text>
                  </TouchableOpacity>

                  {/* Rescan Option */}
                  <TouchableOpacity
                    style={styles.rescanBtn}
                    onPress={() => {
                      setAnalysisResult(null);
                      setProcessedImage(null);
                    }}>
                    <Text style={styles.rescanBtnText}>SCAN ANOTHER CAR</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* STATE B: SCAN STATE */
          <View style={styles.scanStateContainer}>
            {/* Screen Title & Series Callout */}
            <View style={styles.titleSection}>
              <Text style={styles.screenEyebrow}>STREET SHELF ’90 • POCKET COLLECTIBLE</Text>
              <Text style={styles.screenTitle}>SCAN A RIDE</Text>
              <Text style={styles.screenSubtitle}>
                AIM AT ANY CAR TO TURN IT INTO A 1:64 DIE-CAST COLLECTIBLE
              </Text>
            </View>

            {/* Die-Cast Viewfinder Frame */}
            <View style={styles.viewfinderCard}>
              {/* Precision Registration Corner Brackets */}
              <View style={[styles.cornerBracket, styles.bracketTopLeft]} />
              <View style={[styles.cornerBracket, styles.bracketTopRight]} />
              <View style={[styles.cornerBracket, styles.bracketBottomLeft]} />
              <View style={[styles.cornerBracket, styles.bracketBottomRight]} />

              {/* Viewfinder Center Mechanics */}
              <View style={styles.viewfinderCenter}>
                <View style={styles.lensCrosshair}>
                  <View style={styles.plusHoriz} />
                  <View style={styles.plusVert} />
                </View>
                <Text style={styles.viewfinderPrompt}>1:64 SPECIMEN FRAME</Text>
                <Text style={styles.viewfinderSub}>
                  Fit entire passenger vehicle from bumper to bumper
                </Text>
                <View style={styles.readyBadge}>
                  <View style={styles.readyDot} />
                  <Text style={styles.readyText}>READY TO PACKAGE</Text>
                </View>
              </View>

              {/* Loading Indicator Overlay */}
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.packaging.racingYellow} />
                  <Text style={styles.loadingText}>{loadingStep}</Text>
                </View>
              )}
            </View>

            {/* Error Notice */}
            {errorMsg && (
              <View style={styles.errorNotice}>
                <Text style={styles.errorNoticeText}>{errorMsg}</Text>
              </View>
            )}

            {/* Primary Camera & Gallery Actions */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.primaryScanBtn}
                onPress={() => handleProcessImage(capturePhotoFromCamera())}
                disabled={loading}>
                <Text style={styles.primaryScanBtnText}>SCAN CAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryChooseBtn}
                onPress={() => handleProcessImage(pickPhotoFromGallery())}
                disabled={loading}>
                <Text style={styles.secondaryChooseBtnText}>CHOOSE PHOTO</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background, // Warm gallery charcoal #16171B
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandHeader: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 16,
  },
  titleSection: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 20,
  },
  screenEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.packaging.racingYellow,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  screenTitle: {
    color: '#F8F9FA',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.8,
    lineHeight: 34,
  },
  screenSubtitle: {
    color: '#9CA3AF',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  viewfinderCard: {
    width: '100%',
    maxWidth: 420,
    height: 270,
    backgroundColor: '#1E2129',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2D323E',
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cornerBracket: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: Colors.packaging.racingYellow,
    zIndex: 2,
  },
  bracketTopLeft: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  bracketTopRight: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bracketBottomLeft: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bracketBottomRight: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  lensCrosshair: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  plusHoriz: {
    width: 24,
    height: 2,
    backgroundColor: Colors.packaging.racingYellow,
  },
  plusVert: {
    position: 'absolute',
    height: 24,
    width: 2,
    backgroundColor: Colors.packaging.racingYellow,
  },
  viewfinderPrompt: {
    color: '#F8F9FA',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  viewfinderSub: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  readyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.packaging.racingYellow,
  },
  readyText: {
    color: Colors.packaging.racingYellow,
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(22, 23, 27, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 12,
  },
  loadingText: {
    color: Colors.packaging.racingYellow,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  errorNotice: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorNoticeText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultViewContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  scanStateContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  resultHeaderPill: {
    backgroundColor: '#F3EFE6',
    borderWidth: 1.5,
    borderColor: '#D8D1BE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
    alignSelf: 'center',
  },
  specimenPhotoFrame: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#181A20',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#D8D1BE',
  },
  specimenImage: {
    width: '100%',
    height: '100%',
  },
  specimenBlank: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specimenBlankText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  editorialResultCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FAF7EE', // Printed warm packaging cardstock
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#D8D1BE',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  rescanBtn: {
    marginTop: 10,
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D8D1BE',
    backgroundColor: '#F3EFE6',
  },
  rescanBtnText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  matchIdentifiedSection: {
    alignItems: 'center',
    gap: 4,
  },
  resultBadge: {
    color: '#DC2626', // Classic collectible packaging red
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  resultMake: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultModel: {
    color: '#141518', // Deep packaging ink
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginVertical: 1,
  },
  resultVariant: {
    color: Colors.packaging.packagingBlue,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  resultColor: {
    color: '#52525B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  createCollectibleBtn: {
    backgroundColor: Colors.packaging.packagingRed,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.packaging.packagingRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  createCollectibleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  controlsContainer: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
  },
  primaryScanBtn: {
    backgroundColor: Colors.packaging.packagingRed,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.packaging.packagingRed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryScanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  secondaryChooseBtn: {
    backgroundColor: '#22252E',
    borderWidth: 1.5,
    borderColor: '#373C4B',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryChooseBtnText: {
    color: '#F8F9FA',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
