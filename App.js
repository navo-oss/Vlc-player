import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PlayerScreen from './src/screens/PlayerScreen';

export default function App() {
  // 'home' හෝ 'player' විදිහට screen එක මාරු කරන්න state එකක්
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);

  const playVideo = (url) => {
    setSelectedVideoUrl(url);
    setCurrentScreen('player');
  };

  const goBack = () => {
    setCurrentScreen('home');
    setSelectedVideoUrl(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />
      <View style={styles.background}>
        {currentScreen === 'home' ? (
          <HomeScreen onPlay={playVideo} />
        ) : (
          <PlayerScreen videoUrl={selectedVideoUrl} onBack={goBack} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep Dark Navy/Black background
  },
  background: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
});
