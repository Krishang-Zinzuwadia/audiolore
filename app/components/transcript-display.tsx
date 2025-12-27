import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { DialogueLine } from "../types";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

interface TranscriptDisplayProps {
  lines: DialogueLine[];
  currentLineIndex?: number;
}

/**
 * Generate a consistent color from a string (speaker name)
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  lines,
  currentLineIndex = -1,
}) => {
  const scrollRef = React.useRef<ScrollView>(null);

  // Auto-scroll when current line changes
  React.useEffect(() => {
    if (scrollRef.current && currentLineIndex >= 0) {
      // Approximate scroll position (each line ~60px)
      scrollRef.current.scrollTo({
        y: Math.max(0, currentLineIndex * 60 - 100),
        animated: true,
      });
    }
  }, [currentLineIndex]);

  if (lines.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Waiting for transcript...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {lines.map((line, index) => {
        const isNarrator = line.speaker.toLowerCase() === "narrator";
        const speakerColor = isNarrator
          ? colors.gray
          : stringToColor(line.speaker);
        const isActive = index === currentLineIndex;
        const isPast = index < currentLineIndex;

        return (
          <View
            key={index}
            style={[
              styles.lineContainer,
              isActive && styles.lineContainerActive,
            ]}
          >
            <Text
              style={[
                styles.speaker,
                { color: speakerColor },
                isActive && styles.speakerActive,
              ]}
            >
              {line.speaker.toUpperCase()}
            </Text>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.lineText,
                  isNarrator && styles.lineTextNarrator,
                  isPast && styles.lineTextPast,
                  isActive && styles.lineTextActive,
                ]}
              >
                {line.text}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.gray,
    fontSize: typography.sizes.md,
    fontStyle: "italic",
  },
  lineContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  lineContainerActive: {
    backgroundColor: "rgba(55, 19, 236, 0.15)",
  },
  speaker: {
    width: 80,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "right",
    paddingRight: spacing.md,
    paddingTop: 2,
  },
  speakerActive: {
    opacity: 1,
  },
  textContainer: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: colors.secondaryDark,
    paddingLeft: spacing.md,
  },
  lineText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
  lineTextNarrator: {
    fontStyle: "italic",
    color: colors.gray,
  },
  lineTextPast: {
    color: colors.gray,
  },
  lineTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
});
