import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Download, Play, FileVideo } from 'lucide-react-native';

export default function HomeScreen({ onPlay }) {
  const [magnetLink, setMagnetLink] = useState('');
  
  // මේක තාවකාලික Mock Data එකක්. පස්සේ අපි මේක Torrent එකෙන් එන ෆයිල් ලිස්ට් එකට replace කරනවා.
  const [files, setFiles] = useState([]);

  const handleFetchFiles = () => {
    if (!magnetLink) return;
    // පස්සේ මෙතනට Backend/Torrent logic එක එනවා. දැනට ලස්සනට පෙන්නන්න fake files 2ක් දාමු.
    setFiles([
      { id: '1', name: 'Avengers.Doomsday.2026.1080p.mp4', size: '2.4 GB', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
      { id: '2', name: 'Avengers.Doomsday.2026.Sample.mp4', size: '45 MB', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
    ]);
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.fileCard}>
      <View style={styles.fileInfo}>
        <FileVideo color="#a8b2d1" size={24} />
        <View style={styles.textContainer}>
          <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.fileSize}>{item.size}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onPlay(item.streamUrl)}>
          <Play color="#00F0FF" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Download color="#B026FF" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Stream<Text style={styles.neonText}>X</Text></Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Paste Magnet Link here..."
          placeholderTextColor="#64748b"
          value={magnetLink}
          onChangeText={setMagnetLink}
        />
        <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchFiles}>
          <Text style={styles.fetchBtnText}>Fetch</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={files}
        keyExtractor={item => item.id}
        renderItem={renderFileItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
  },
  neonText: {
    color: '#00F0FF', // Neon Blue
    textShadowColor: 'rgba(0, 240, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  fetchBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginLeft: 10,
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  fetchBtnText: {
    color: '#0B0F19',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  fileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Glassmorphism card
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileSize: {
    color: '#a8b2d1',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  iconBtn: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  }
});
