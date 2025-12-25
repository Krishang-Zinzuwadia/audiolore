import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TranscriptSegment } from '../types';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface TranscriptDisplayProps {
  transcript: TranscriptSegment[];
  currentTime: number;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  currentTime,
}) => {
  const getCurrentSegmentIndex = (): number => {
    return transcript.findIndex(
      (segment) => currentTime >= segment.startTime && currentTime < segment.endTime
    );
  };

  const currentIndex = getCurrentSegmentIndex();
  const currentSegment = currentIndex >= 0 ? transcript[currentIndex] : transcript[0];
  const nextSegment = currentIndex >= 0 && currentIndex < transcript.length - 1
    ? transcript[currentIndex + 1]
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.currentTextContainer}>
        <Text style={styles.currentText}>{currentSegment?.text || ''}</Text>
      </View>
      <ScrollView style={styles.fullTranscript} showsVerticalScrollIndicator={false}>
        {transcript.map((segment, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          const isUpcoming = index > currentIndex;
          return (
            <Text
              key={index}
              style={[
                styles.transcriptLine,
                isActive && styles.transcriptLineActive,
                isUpcoming && styles.transcriptLineUpcoming,
                isPast && styles.transcriptLinePast,
              ]}
            >
              {segment.text}
            </Text>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  currentTextContainer: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  currentText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    lineHeight: 32,
  },
  fullTranscript: {
    flex: 1,
  },
  transcriptLine: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.md,
    lineHeight: 24,
    textAlign: 'left',
  },
  transcriptLineActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  transcriptLineUpcoming: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  transcriptLinePast: {
    color: colors.gray,
    fontWeight: typography.weights.regular,
  },
});
