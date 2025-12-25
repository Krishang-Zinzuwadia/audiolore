import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);

  const recentUploads = [
    { id: '1', name: 'My Custom Upload.mp3', date: '2024-01-15', size: '45.2 MB' },
    { id: '2', name: 'Personal Recording.m4a', date: '2024-01-10', size: '28.7 MB' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload</Text>
          
          <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
            <Ionicons name="cloud-upload-outline" size={24} color={colors.white} />
            <Text style={styles.uploadButtonText}>Upload Audiobook</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Uploads</Text>
            {recentUploads.map((upload) => (
              <View key={upload.id} style={styles.uploadItem}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.uploadInfo}>
                  <Text style={styles.uploadName}>{upload.name}</Text>
                  <Text style={styles.uploadMeta}>
                    {upload.date} • {upload.size}
                  </Text>
                </View>
                <TouchableOpacity style={styles.uploadAction}>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.gray} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon" size={24} color={colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>
                    Use dark theme for better viewing at night
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="play-skip-forward" size={24} color={colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto-Play Next</Text>
                  <Text style={styles.settingDescription}>
                    Automatically play next book in queue
                  </Text>
                </View>
              </View>
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingLeft}>
                <Ionicons name="wifi" size={24} color={colors.white} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Download over Wi-Fi only</Text>
                  <Text style={styles.settingDescription}>
                    Save mobile data by downloading only on Wi-Fi
                  </Text>
                </View>
              </View>
              <Switch
                value={downloadOverWifi}
                onValueChange={setDownloadOverWifi}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Name</Text>
              <Text style={styles.aboutValue}>Audio Lore</Text>
            </View>
            <View style={[styles.aboutRow, styles.aboutRowLast]}>
              <Text style={styles.aboutLabel}>Developer</Text>
              <Text style={styles.aboutValue}>Audio Lore Team</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} activeOpacity={0.7}>
            <Text style={styles.linkButtonText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.secondaryDark,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  cardTitle: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(55, 19, 236, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadName: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  uploadMeta: {
    color: colors.gray,
    fontSize: typography.sizes.sm,
  },
  uploadAction: {
    padding: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  settingDescription: {
    color: colors.gray,
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  aboutRowLast: {
    borderBottomWidth: 0,
  },
  aboutLabel: {
    color: colors.gray,
    fontSize: typography.sizes.md,
  },
  aboutValue: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryDark,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  linkButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
