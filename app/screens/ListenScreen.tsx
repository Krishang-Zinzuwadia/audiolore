import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PlaybackControls } from '../components/PlaybackControls';
import { TranscriptDisplay } from '../components/TranscriptDisplay';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { PlaybackState } from '../types';

interface ListenScreenProps {
  route: any;
  navigation: any;
}

export const ListenScreen: React.FC<ListenScreenProps> = ({ route, navigation }) => {
  const { audiobook } = route.params || {};

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: audiobook?.duration ? audiobook.duration * audiobook.progress : 0,
    speed: 1,
  });

  const [showFullTranscript, setShowFullTranscript] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (playbackState.isPlaying) {
      interval = setInterval(() => {
        setPlaybackState((prev) => {
          const newTime = prev.currentTime + prev.speed;
          if (newTime >= audiobook.duration) {
            return { ...prev, currentTime: audiobook.duration, isPlaying: false };
          }
          return { ...prev, currentTime: newTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playbackState.isPlaying, playbackState.speed, audiobook?.duration]);

  const handlePlayPause = () => {
    setPlaybackState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackState((prev) => ({ ...prev, speed }));
  };

  const handleSeek = (time: number) => {
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
  };

  if (!audiobook) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No audiobook selected</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        {showFullTranscript ? (
          <>
            <Text style={styles.headerText}>{audiobook.title}</Text>
            <TouchableOpacity
              style={styles.closeTranscriptButton}
              onPress={() => setShowFullTranscript(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {showFullTranscript ? (
        <View style={styles.fullTranscriptView}>
          <View style={styles.transcriptSpeedControl}>
            <TouchableOpacity
              style={styles.speedControlButton}
              onPress={() => {
                const speeds = [0.75, 1, 1.25, 1.5, 2];
                const currentIndex = speeds.indexOf(playbackState.speed);
                const nextIndex = (currentIndex + 1) % speeds.length;
                handleSpeedChange(speeds[nextIndex]);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.speedControlText}>{playbackState.speed}x</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.fullTranscriptScroll}
            contentContainerStyle={styles.fullTranscriptContent}
            showsVerticalScrollIndicator={false}
          >
            <TranscriptDisplay
              transcript={audiobook.transcript}
              currentTime={playbackState.currentTime}
            />
          </ScrollView>
          <View style={styles.transcriptControlsContainer}>
            <PlaybackControls
              playbackState={playbackState}
              duration={audiobook.duration}
              onPlayPause={handlePlayPause}
              onSpeedChange={handleSpeedChange}
              onSeek={handleSeek}
              onToggleTranscript={() => setShowFullTranscript(!showFullTranscript)}
              showFullTranscript={showFullTranscript}
              transcriptMode={true}
            />
          </View>
        </View>
      ) : (
        <View style={styles.mainContent}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{audiobook.title}</Text>
            <Text style={styles.author}>{audiobook.author}</Text>
          </View>

          <View style={styles.coverContainer}>
            <LinearGradient
              colors={audiobook.coverGradient || [audiobook.coverColor, audiobook.coverColor]}
              style={styles.coverArt}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.controlsContainer}>
            <PlaybackControls
              playbackState={playbackState}
              duration={audiobook.duration}
              onPlayPause={handlePlayPause}
              onSpeedChange={handleSpeedChange}
              onSeek={handleSeek}
              onToggleTranscript={() => setShowFullTranscript(!showFullTranscript)}
              showFullTranscript={showFullTranscript}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerText: {
    color: colors.white,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  headerSpacer: {
    width: 44,
  },
  closeTranscriptButton: {
    padding: spacing.sm,
  },
  fullTranscriptView: {
    flex: 1,
  },
  transcriptSpeedControl: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  speedControlButton: {
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  speedControlText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  fullTranscriptScroll: {
    flex: 1,
  },
  fullTranscriptContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  transcriptControlsContainer: {
    paddingBottom: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  coverArt: {
    width: 280,
    height: 280,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    color: colors.white,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  author: {
    color: colors.gray,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  transcriptContainer: {
    minHeight: 200,
    marginBottom: spacing.xl,
  },
  controlsContainer: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
});
