import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Switch,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/* ---------------- TYPES ---------------- */
type SettingItem = {
  key: string;
  label: string;
  description?: string;
  value: boolean;
};

/* ---------------- SEEDED SETTINGS ---------------- */
const initialSettings: SettingItem[] = [
  { key: 'location', label: 'Enable Location', value: true },
  { key: 'camera', label: 'Enable Camera', value: false },
  { key: 'audio', label: 'Enable Microphone', value: false },
  { key: 'photos', label: 'Allow Photo Uploads', value: true },
];

const LOCAL_KEY = 'settings_v1';

/* ---------------- COMPONENT ---------------- */
export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);

  /* ---------------- BACKGROUND (SAME AS RECORDS) ---------------- */
  const particles = useRef<{ x: number; y: number; s: number }[]>([]);
  const [cursor, setCursor] = useState({ x: width / 2, y: height / 2 });

  useEffect(() => {
    particles.current = Array.from({ length: 35 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      s: Math.random() * 3 + 2,
    }));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      particles.current = particles.current.map(p => ({
        ...p,
        x: p.x + (cursor.x - width / 2) * 0.003,
        y: p.y + (cursor.y - height / 2) * 0.003,
      }));
    }, 30);
    return () => clearInterval(id);
  }, [cursor]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) =>
        setCursor({ x: g.moveX, y: g.moveY }),
    })
  ).current;

  /* ---------------- DATA ---------------- */
  useEffect(() => {
    const local = localStorage.getItem(LOCAL_KEY);
    if (local) setSettings(JSON.parse(local));
    else localStorage.setItem(LOCAL_KEY, JSON.stringify(initialSettings));
  }, []);

  function toggle(key: string) {
    const updated = settings.map(s =>
      s.key === key ? { ...s, value: !s.value } : s
    );
    setSettings(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  function resetAll() {
    setSettings(initialSettings);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(initialSettings));
  }

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Background */}
      {particles.current.map((p, i) => (
        <View
          key={i}
          style={[
            styles.particle,
            { left: p.x, top: p.y, width: p.s, height: p.s },
          ]}
        />
      ))}

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Settings</Text>

        <View style={styles.card}>
          {settings.map(item => (
            <View key={item.key} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Switch
                value={item.value}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#ccc', true: '#ff3b30' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
          <Text style={styles.resetText}>Reset All Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255,0,0,0.25)',
  },

  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },

  card: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 14,
    padding: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
  },

  resetBtn: {
    marginTop: 24,
    backgroundColor: '#ff3b30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  resetText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
