import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { BookCard } from '../components/book-card';
import { mockAudiobooks } from '../data/mockData';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
import { Audiobook } from '../types';

const screenWidth = Dimensions.get('window').width;
const bookWidth = (screenWidth - spacing.lg * 5) / 2;

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const readyToListen = mockAudiobooks.filter((book) => !book.isUploaded);
  const myUploads = mockAudiobooks.filter((book) => book.isUploaded);

  const handleBookPress = (audiobook: Audiobook) => {
    navigation.navigate('Listen', { audiobook });
  };

  const renderBookGrid = (books: Audiobook[]) => {
    const rows: Audiobook[][] = [];
    for (let i = 0; i < books.length; i += 2) {
      rows.push(books.slice(i, i + 2));
    }

    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.bookRow}>
        {row.map((book) => (
          <BookCard
            key={book.id}
            audiobook={book}
            onPress={() => handleBookPress(book)}
          />
        ))}
        {row.length === 1 && <View style={styles.bookSpacer} />}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Audio Lore</Text>
        <Text style={styles.headerSubtitle}>Your Audiobook Library</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready to Listen</Text>
          <View style={styles.bookshelf}>
            {renderBookGrid(readyToListen)}
          </View>
        </View>

        {myUploads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Uploads</Text>
            <View style={styles.bookshelf}>
              {renderBookGrid(myUploads)}
            </View>
          </View>
        )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.gray,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bookshelf: {
    paddingHorizontal: spacing.lg,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  bookSpacer: {
    width: bookWidth,
  },
});
