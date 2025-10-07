import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import settingsData from './data/settingsData.json';
import ToggleItem from './components/ToggleItem';
import SectionTitle from './components/SectionTitle';
import BottomNav from './components/BottomNav';

// Define the shape of a single setting item
interface SettingItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  value: boolean;
  category: string;
}

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<SettingItem[]>(settingsData);

  // Toggle a boolean setting by key
  const handleToggle = (key: string) => {
    const updatedSettings = settings.map(item =>
      item.key === key ? { ...item, value: !item.value } : item
    );
    setSettings(updatedSettings);
  };

  // Save button handler (example)
  const handleSave = () => {
    // You can persist settings here (AsyncStorage, API, etc.)
    console.log('Settings saved:', settings);
    alert('Settings saved!');
  };

  // Filter settings by category
  const renderCategory = (category: string) => {
    const filtered = settings.filter(item => item.category === category);
    if (!filtered.length) return null;

    return (
      <View style={styles.sectionContainer}>
        <SectionTitle title={category.charAt(0).toUpperCase() + category.slice(1)} />
        {filtered.map(item => (
          <ToggleItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            description={item.description}
            value={item.value}
            onValueChange={() => handleToggle(item.key)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Settings</Text>

        {/* Render Permissions section */}
        {renderCategory('permissions')}

        {/* Save Changes button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="Settings" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra space for bottom nav
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#222',
  },
  sectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;
