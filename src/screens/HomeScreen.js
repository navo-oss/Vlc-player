import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Download, Play, FileVideo, CheckCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { addMagnetAndGetFiles } from '../utils/torrentApi';

export default function HomeScreen({ onPlay }) {
  const [magnetLink, setMagnetLink] = useState('');
  const [files, setFiles] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Download Status ට්‍රැක් කරන්න
  const [downloadProgress, setDownloadProgress] = useState({}); // { id: 0.45 } (45%)
  const [downloadedFiles, setDownloadedFiles] = useState({});   // { id: 'file://...' }

  const handleFetchFiles = async () => {
    if (!magnetLink) {
      Alert.alert("Error", "Please paste a magnet link first!");
      return;
    }
    
    setIsFetching(true);
    setFiles([]);
    const fetchedFiles = await addMagnetAndGetFiles(magnetLink);
    
    if (fetchedFiles && fetchedFiles.length > 0) {
      setFiles(fetchedFiles);
    } else {
      Alert.alert("Error", "Failed to fetch torrent files.");
    }
    setIsFetching(false);
  };

  // ෆයිල් එක ඩවුන්ලෝඩ් කරන Function එක
  const handleDownload = async (item) => {
    if (downloadProgress[item.id] !== undefined) {
      Alert.alert("Notice", "File is already downloading!");
      return;
    }

    const fileUri = FileSystem.documentDirectory + item.name;
    
    // Download Progress එක අප්ඩේට් කරන Callback එක
    const callback = downloadProgress => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      setDownloadProgress(prev => ({ ...prev, [item.id]: progress }));
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      item.streamUrl,
      fileUri,
      {},
      callback
    );

    try {
      setDownloadProgress(prev => ({ ...prev, [item.id]: 0 })); // 0% න් පටන් ගන්නවා
      const { uri } = await downloadResumable.downloadAsync();
      
      // ඩවුන්ලෝඩ් එක ඉවර වුණාම state අප්ඩේට් කිරීම
      setDownloadProgress(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
      setDownloadedFiles(prev => ({ ...prev, [item.id]: uri }));
      
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Download failed!");
      setDownloadProgress(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  // Play බට්න් එක එබුවම ඩවුන්ලෝඩ් වෙච්ච එකක් නම් ඒක (Offline) ප්ලේ කරනවා, නැත්නම් Stream කරනවා
  const handlePlay = (item) => {
    const playUrl = downloadedFiles[item.id] ? downloadedFiles[item.id] : item.streamUrl;
    onPlay(playUrl);
  };

  const renderFileItem = ({ item }) => {
    const isDownloading = downloadProgress[item.id] !== undefined;
    const isDownloaded = downloadedFiles[item.id] !== undefined;
    const progressPercent = isDownloading ? Math.round(downloadProgress[item.id] * 100) : 0;

    return (
      <View style={styles.fileCard}>
        <View style={styles.fileInfoRow}>
          <FileVideo color={isDownloaded ? "#00F0FF" : "#a8b2d1"} size={24} />
          <View style={styles.textContainer}>
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.fileSize}>
              {item.size} {isDownloaded ? "• Offline Ready" : ""}
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => handlePlay(item)}>
              <Play color="#00F0FF" size={22} />
            </TouchableOpacity>
            
            {/* ඩවුන්ලෝඩ් වෙලා ඉවර නම් හරියක් පෙන්නනවා, නැත්නම් ඩවුන්ලෝඩ් බට්න් එක */}
            {!isDownloaded ? (
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleDownload(item)}>
                <Download color={isDownloading ? "#64748b" : "#B026FF"} size={22} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.iconBtn, { backgroundColor: 'transparent' }]}>
                <CheckCircle color="#00F0FF" size={22} />
              </View>
            )}
          </View>
        </View>

        {/* ලස්සන Neon Progress Bar එක */}
        {isDownloading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{progressPercent}%</Text>
          </View>
        )}
      </View>
    );
  };

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
        <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchFiles} disabled={isFetching}>
          {isFetching ? <ActivityIndicator color="#0B0F19" /> : <Text style={styles.fetchBtnText}>Fetch</Text>}
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
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginTop: 40, marginBottom: 30, textAlign: 'center' },
  neonText: { color: '#00F0FF', textShadowColor: 'rgba(0, 240, 255, 0.8)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  input: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 15, color: '#ffffff', fontSize: 16 },
  fetchBtn: { backgroundColor: '#00F0FF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  fetchBtnText: { color: '#0B0F19', fontWeight: 'bold', fontSize: 16 },
  listContainer: { paddingBottom: 20 },
  
  fileCard: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 15, marginBottom: 15, flexDirection: 'column' },
  fileInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textContainer: { marginLeft: 12, flex: 1 },
  fileName: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  fileSize: { color: '#a8b2d1', fontSize: 12, marginTop: 4 },
  actionButtons: { flexDirection: 'row', marginLeft: 10 },
  iconBtn: { padding: 8, marginLeft: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 8 },
  
  // Progress Bar Styles
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  progressBarBackground: { flex: 1, height: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#B026FF', shadowColor: '#B026FF', shadowOpacity: 0.8, shadowRadius: 5 },
  progressText: { color: '#B026FF', fontSize: 12, marginLeft: 10, fontWeight: 'bold', width: 35, textAlign: 'right' }
});
