import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { ArrowLeft, Captions } from 'lucide-react-native';

export default function PlayerScreen({ videoUrl, onBack }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [subtitle, setSubtitle] = useState(null);

  // Subtitle File එකක් ෆෝන් එකෙන් තෝරන Function එක
  const pickSubtitle = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // .srt හෝ .vtt ෆයිල් ගන්න
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSubtitle(result.assets[0].name);
        alert(`Subtitle Loaded: ${result.assets[0].name}`);
        // සැබෑ ලෝකයේදී මේ subtitle එක parse කරලා වීඩියෝ එක උඩින් පෙන්නන්න ඕන.
      }
    } catch (err) {
      console.log("Error picking subtitle", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Glassmorphism Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Stream<Text style={styles.neonText}>X</Text> Player
        </Text>
        <TouchableOpacity onPress={pickSubtitle} style={styles.iconBtn}>
          {/* Subtitle එකක් ලෝඩ් කරලනම් අයිකන් එක Neon Blue වෙනවා */}
          <Captions color={subtitle ? "#00F0FF" : "#ffffff"} size={24} />
        </TouchableOpacity>
      </View>

      {/* Video Player Section */}
      <View style={styles.playerContainer}>
        {!status.isLoaded && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#00F0FF" />
            <Text style={styles.loadingText}>Buffering Stream...</Text>
          </View>
        )}
        
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: videoUrl }}
          useNativeControls={true} // Default ප්ලේයර් කන්ට්‍රෝල්ස් (Seek bar, Play/Pause, Fullscreen)
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
      </View>

      {/* Subtitle Info (යටින් පෙන්නන්න) */}
      {subtitle && (
        <View style={styles.subtitleInfo}>
          <Text style={styles.subtitleText}>Subtitles: {subtitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // වීඩියෝ බලනකොට Background එක සම්පූර්ණ කළු වෙන එක හොඳයි
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(11, 15, 25, 0.8)', // Glassmorphism
    zIndex: 10,
  },
  iconBtn: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  neonText: {
    color: '#00F0FF',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  loadingText: {
    color: '#00F0FF',
    marginTop: 10,
    fontWeight: '600',
  },
  subtitleInfo: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subtitleText: {
    color: '#00F0FF',
    fontSize: 12,
  }
});
