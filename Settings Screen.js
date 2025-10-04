import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';

const SettingsScreen = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [photoEnabled, setPhotoEnabled] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>« Settings</Text>

      {/* Location */}
      <View style={styles.settingItem}>
        <Text style={styles.settingTitle}>Location</Text>
        <Text style={styles.settingDescription}>
          Set the location so the app can track you
        </Text>
        <Switch
          value={locationEnabled}
          onValueChange={setLocationEnabled}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={locationEnabled ? '#fff' : '#888'}
        />
      </View>

      {/* Camera */}
      <View style={styles.settingItem}>
        <Text style={styles.settingTitle}>Camera</Text>
        <Text style={styles.settingDescription}>
          Enable camera access so that the app can use camera while in panic mode
        </Text>
        <Switch
          value={cameraEnabled}
          onValueChange={setCameraEnabled}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={cameraEnabled ? '#fff' : '#888'}
        />
      </View>

      {/* Audio */}
      <View style={styles.settingItem}>
        <Text style={styles.settingTitle}>Audio</Text>
        <Text style={styles.settingDescription}>
          Enable audio access so that the app can use audio while in panic mode
        </Text>
        <Switch
          value={audioEnabled}
          onValueChange={setAudioEnabled}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={audioEnabled ? '#fff' : '#888'}
        />
      </View>

      {/* Photo */}
      <View style={styles.settingItem}>
        <Text style={styles.settingTitle}>Photo</Text>
        <Text style={styles.settingDescription}>
          Enable photo access so that the app can use photo while in panic mode
        </Text>
        <Switch
          value={photoEnabled}
          onValueChange={setPhotoEnabled}
          trackColor={{ false: '#ccc', true: '#4CAF50' }}
          thumbColor={photoEnabled ? '#fff' : '#888'}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  settingItem: {
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
});

export default SettingsScreen;
