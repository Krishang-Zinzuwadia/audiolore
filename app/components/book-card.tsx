import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audiobook } from '../types';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface BookCardProps {
  audiobook: Audiobook;
  onPress: () => void;
}

const screenWidth = Dimensions.get('window').width;
const bookWidth = (screenWidth - spacing.md * 3) / 2;

export const BookCard: React.FC<BookCardProps> = ({ audiobook, onPress }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={audiobook.coverGradient || [audiobook.coverColor, audiobook.coverColor]}
        style={styles.bookCover}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {audiobook.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${audiobook.progress * 100}%` }]} />
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{formatDuration(audiobook.duration)}</Text>
        </View>
      </LinearGradient>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {audiobook.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {audiobook.author}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: bookWidth,
    marginBottom: spacing.lg,
  },
  bookCover: {
    width: '100%',
    height: bookWidth * 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.white,
  },
  durationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  infoContainer: {
    marginTop: spacing.sm,
    paddingHorizontal: 4,
  },
  title: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: 4,
    lineHeight: 20,
  },
  author: {
    color: colors.gray,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
});
