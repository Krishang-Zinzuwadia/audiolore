import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { PlaybackState } from '../types';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  duration: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  onToggleTranscript: () => void;
  showFullTranscript: boolean;
  transcriptMode?: boolean;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playbackState,
  duration,
  onPlayPause,
  onSpeedChange,
  onSeek,
  onToggleTranscript,
  showFullTranscript,
  transcriptMode = false,
}) => {
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? playbackState.currentTime / duration : 0;

  const handleSkipBack = () => {
    onSeek(Math.max(0, playbackState.currentTime - 10));
  };

  const handleSkipForward = () => {
    onSeek(Math.min(duration, playbackState.currentTime + 10));
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressSection}>
        <Text style={styles.timeText}>{formatTime(playbackState.currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={playbackState.currentTime}
          onSlidingComplete={(value) => onSeek(value)}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.secondaryDark}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View>
        {!transcriptMode && showSpeedDropdown && (
          <View style={styles.speedDropdownMenu}>
            {SPEED_OPTIONS.map((speed) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedMenuItem,
                  playbackState.speed === speed && styles.speedMenuItemActive,
                ]}
                onPress={() => {
                  onSpeedChange(speed);
                  setShowSpeedDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.speedMenuText,
                    playbackState.speed === speed && styles.speedMenuTextActive,
                  ]}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.speedDropdownButton} 
          onPress={() => transcriptMode ? (() => {
            const speeds = [0.75, 1, 1.25, 1.5, 2];
            const currentIndex = speeds.indexOf(playbackState.speed);
            const nextIndex = (currentIndex + 1) % speeds.length;
            onSpeedChange(speeds[nextIndex]);
          })() : setShowSpeedDropdown(!showSpeedDropdown)}
          activeOpacity={0.7}
        >
          <Text style={styles.speedDropdownText}>{playbackState.speed}x</Text>
          {!transcriptMode && <Ionicons name="chevron-down" size={16} color={colors.white} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkipBack}
          activeOpacity={0.7}
        >
          <Ionicons name="play-back" size={32} color={colors.white} />
          <Text style={styles.skipText}>10s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playPauseButton}
          onPress={onPlayPause}
          activeOpacity={0.8}
        >
          <Ionicons
            name={playbackState.isPlaying ? 'pause' : 'play'}
            size={48}
            color={colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkipForward}
          activeOpacity={0.7}
        >
          <Ionicons name="play-forward" size={32} color={colors.white} />
          <Text style={styles.skipText}>10s</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.transcriptButton} 
          onPress={onToggleTranscript}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showFullTranscript ? "list" : "mic"} 
            size={24} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timeText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    minWidth: 45,
  },
  slider: {
    flex: 1,
    marginHorizontal: spacing.md,
    height: 40,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  speedDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: 4,
  },
  speedDropdownText: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    marginTop: 4,
  },
  transcriptButton: {
    backgroundColor: colors.secondaryDark,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  speedDropdownMenu: {
    position: 'absolute',
    bottom: 60,
    left: spacing.lg,
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  speedMenuItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  speedMenuItemActive: {
    backgroundColor: 'rgba(55, 19, 236, 0.2)',
  },
  speedMenuText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  speedMenuTextActive: {
    color: colors.primary,
  },
});
