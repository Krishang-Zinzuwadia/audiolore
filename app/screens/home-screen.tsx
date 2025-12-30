import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { BookCard } from '../components/book-card';
import { getAllBooks } from '../services/audioService';
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
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await getAllBooks();
      
      // Transform API response to Audiobook format
      const audiobooks: Audiobook[] = booksData.map((book) => ({
        id: book.book_id,
        title: book.title,
        author: book.author,
        duration: Math.floor(book.total_length / 1000), // Rough estimate
        progress: 0,
        coverColor: getRandomColor(),
        isUploaded: false,
        transcript: [],
      }));
      
      setBooks(audiobooks);
      setError(null);
    } catch (err) {
      setError('Failed to load books. Make sure the backend is running.');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ['#3713ec', '#9b4ef6', '#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const readyToListen = books.filter((book) => !book.isUploaded);
  const myUploads = books.filter((book) => book.isUploaded);

  const handleBookPress = (audiobook: Audiobook) => {
    navigation.navigate('Listen', { audiobook });
  };

  const renderBookGrid = (booksList: Audiobook[]) => {
    const rows: Audiobook[][] = [];
    for (let i = 0; i < booksList.length; i += 2) {
      rows.push(booksList.slice(i, i + 2));
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>Check if backend is running on port 8000</Text>
        </View>
      </SafeAreaView>
    );
  }

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
