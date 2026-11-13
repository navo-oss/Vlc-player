import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { ArrowLeft, Captions, Gauge } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function PlayerScreen({ videoUrl, onBack }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [subtitle, setSubtitle] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Double Tap ට්‍රැක් කරන්න
  const lastTapRef = useRef(null);

  // Subtitle File එකක් තෝරන Function එක
  const pickSubtitle = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSubtitle(result.assets[0].name);
        alert(`Subtitle Loaded: ${result.assets[0].name}\n(Note: Native overlay requires VTT conversion in Expo)`);
      }
    } catch (err) {
      console.log("Error picking subtitle", err);
    }
  };

  // Speed එක වෙනස් කරන Function එක
  const changeSpeed = async () => {
    let newRate = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
    setPlaybackRate(newRate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(newRate, true);
    }
  };

  // Double Tap 10s Skip Logic
  const handleDoubleTap = async (direction) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // මිලි තත්පර 300ක් ඇතුළත දෙපාරක් ටැප් කළොත්

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
      // ඩබල් ටැප් එකක් අහු වුණා!
      if (status.isLoaded && videoRef.current) {
        const currentPos = status.positionMillis;
        // Direction එක අනුව තත්පර 10ක් (10000ms) ඉස්සරහට හරි පස්සට හරි යවනවා
        const newPos = direction === 'forward' ? currentPos + 10000 : currentPos - 10000;
        await videoRef.current.setPositionAsync(newPos);
      }
      lastTapRef.current = null; // Reset කරනවා
    } else {
      lastTapRef.current = now;
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

        <View style={styles.rightControls}>
          {/* Speed Control Button */}
          <TouchableOpacity onPress={changeSpeed} style={[styles.iconBtn, { marginRight: 10 }]}>
            <Text style={styles.speedText}>{playbackRate}x</Text>
          </TouchableOpacity>
          
          {/* Subtitle Button */}
          <TouchableOpacity onPress={pickSubtitle} style={styles.iconBtn}>
            <Captions color={subtitle ? "#00F0FF" : "#ffffff"} size={22} />
          </TouchableOpacity>
        </View>
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
          useNativeControls={true}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />

        {/* Double Tap Zones (වීඩියෝ එකට උඩින් නොපෙනෙන විදිහට දාලා තියෙන්නේ) */}
        <View style={styles.touchZonesContainer}>
          {/* Left Side - Rewind 10s */}
          <TouchableWithoutFeedback onPress={() => handleDoubleTap('rewind')}>
            <View style={styles.touchZone} />
          </TouchableWithoutFeedback>
          
          {/* Right Side - Forward 10s */}
          <TouchableWithoutFeedback onPress={() => handleDoubleTap('forward')}>
            <View style={styles.touchZone} />
          </TouchableWithoutFeedback>
        </View>
      </View>

      {/* Subtitle Display */}
      {subtitle && (
        <View style={styles.subtitleInfo}>
          <Text style={styles.subtitleText}>Playing with: {subtitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: 'rgba(11, 15, 25, 0.8)', 
    zIndex: 10,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    color: '#00F0FF',
    fontWeight: 'bold',
    fontSize: 14,
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
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  touchZonesContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 2, // වීඩියෝ එකට උඩින් තියෙන්නේ
    bottom: 80, // Default controls වලට බාධා නොවෙන්න යටින් ටිකක් ඉඩ තියලා තියෙන්නේ
  },
  touchZone: {
    flex: 1,
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
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  subtitleText: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
