# Audio Lore - Audiobook Platform

A comprehensive audiobook platform with a React Native mobile app and Python backend for managing and listening to audiobooks.

## Features

### Mobile App (React Native)
- **Bookshelf Grid Layout**: Browse your audiobook collection in a beautiful 2-column grid layout
- **Playback Controls**: Play/pause, speed control (0.75x - 2x), 10-second skip, and progress tracking with slider
- **Real-time Transcripts**: Follow along with synchronized text transcripts in full-screen mode
- **Dark Theme**: Eye-friendly dark interface with custom purple accent color
- **Floating Navigation**: Compact centered bottom navigation bar
- **Settings**: Manage uploads, appearance preferences, and playback settings

### Backend (Python)
- PDF to audiobook conversion using Google AI and ElevenLabs
- Library management system
- Audio streaming capabilities

## Project Structure

```
mobile-app/
├── app/                    # React Native mobile app
│   ├── components/         # UI components (kebab-case)
│   │   ├── book-card.tsx
│   │   ├── bottom-tab-bar.tsx
│   │   ├── playback-controls.tsx
│   │   └── transcript-display.tsx
│   ├── screens/           # Screen components (kebab-case)
│   │   ├── home-screen.tsx
│   │   ├── listen-screen.tsx
│   │   └── settings-screen.tsx
│   ├── constants/         # App constants
│   └── types/             # TypeScript types
├── scripts/               # Python scripts and utilities
├── pdfs/                  # PDF files for conversion
├── outputs/               # Generated audio files
├── services/              # Backend services
├── webapp/                # Web dashboard
└── android/               # Native Android project

```

## Tech Stack

### Mobile App
- React Native with Expo SDK 52
- TypeScript
- React Navigation 7 (Bottom Tabs)
- Expo Linear Gradient
- @react-native-community/slider

### Backend
- Python
- Google AI API
- ElevenLabs API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.x
- Android SDK (for building Android app)
- Expo Go app (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
GOOGLE_API_KEY=""
ELEVENLABS_API_KEY=""
```

3. Start the mobile app:
```bash
npx expo start
# or build for Android
npx expo run:android
```

4. Start the backend:
```bash
python scripts/main.py
```

5. Start the web dashboard:
```bash
cd webapp
npm run dev
```

## Color Palette

- Primary Purple: `#3713ec`
- Background Light: `#f6f6f8`
- Dark Background: `#131022`
- Secondary Dark: `#1d1c27`
- White: `#ffffff`
- Accent: `#9b4ef6`

## Mobile App Screens

### Home Screen
- Grid layout of audiobooks (2 columns)
- "Ready to Listen" and "My Uploads" sections
- Progress indicators and duration badges

### Listen Screen
- Large book cover with gradient
- Interactive progress bar with slider
- Speed controls dropdown
- Playback buttons (10s skip, play/pause)
- Transcript toggle for full-screen transcript mode
- Full transcript view with:
  - Current line highlighted (white bold)
  - Upcoming lines (white bold)
  - Past lines (gray)
  - All playback controls visible

### Settings Screen
- Upload audiobook functionality (UI only)
- Theme preferences
- Playback settings
- About section

## Future Enhancements

- [ ] Actual audio playback with Expo AV
- [ ] Backend integration for user accounts
- [ ] Real file upload functionality
- [ ] Bookmarks and notes
- [ ] Sleep timer
- [ ] Offline downloads
- [ ] Search and filtering
- [ ] Multiple playlists

## License

MIT

3. Scan the QR code with Expo Go app (Android) or Camera app (iOS)

### Running on Specific Platforms

```bash
# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── BookCard.tsx
│   ├── BottomTabBar.tsx
│   ├── PlaybackControls.tsx
│   └── TranscriptDisplay.tsx
├── screens/            # Main application screens
│   ├── HomeScreen.tsx
│   ├── ListenScreen.tsx
│   └── SettingsScreen.tsx
├── constants/          # App-wide constants
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # Mock data
│   └── mockData.ts
└── assets/             # Images and other assets
```

## Screens

### Home Screen
- Displays audiobooks in a 2-column grid bookshelf layout
- Sections: "Ready to Listen" and "My Uploads"
- Shows book covers with progress indicators
- Tap any book to navigate to the Listen screen

### Listen Screen
- Displays currently playing audiobook
- Playback controls (play/pause, skip, speed adjustment)
- Real-time transcript display with highlighted current text
- Progress bar with time indicators

### Settings Screen
- Upload audiobook functionality (UI only)
- Theme preferences (Dark/Light mode toggle)
- Playback settings (auto-play, Wi-Fi downloads)
- About section with app information

## Mock Data

The app includes 10 sample audiobooks with:
- Diverse titles and authors
- Various durations and progress states
- Color-coded book covers
- Sample transcript segments

## Notes

- This is a UI-only implementation
- No actual audio playback functionality yet
- No backend integration
- File uploads are placeholder UI only
- All data is mock data for demonstration

## Future Enhancements

- [ ] Actual audio playback with Expo AV
- [ ] Backend integration for user accounts
- [ ] Real file upload functionality
- [ ] Bookmarks and notes
- [ ] Sleep timer
- [ ] Offline downloads
- [ ] Search and filtering
- [ ] Multiple playlists

## License

MIT
