import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/* ---------------- TYPES ---------------- */
type Status = 'in_progress' | 'resolved' | 'safe';

type RecordItem = {
  id: string;
  circle: string;
  title: string;
  timestamp: string;
  status: Status;
  notes?: string;
};

const LOCAL_KEY = 'sos_records_v1';

/* ---------------- SEEDED DATA ---------------- */
const seededRecords: RecordItem[] = [
  {
    id: '1',
    circle: 'Emergency',
    title: 'Record 1',
    timestamp: '2024-09-14T11:20:00Z',
    status: 'in_progress',
    notes: 'Some some text will come here',
  },
  {
    id: '2',
    circle: 'Friends',
    title: 'Record 2',
    timestamp: '2024-09-14T11:20:00Z',
    status: 'resolved',
  },
  {
    id: '3',
    circle: 'Sibling',
    title: 'Record 3',
    timestamp: '2024-09-20T21:50:00Z',
    status: 'safe',
  },
];

/* ---------------- HELPERS ---------------- */
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toDateString();
}

/* ---------------- COMPONENT ---------------- */
export default function MyRecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<RecordItem | null>(null);

  /* ---------------- BACKGROUND ---------------- */
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
    if (!local) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(seededRecords));
      setRecords(seededRecords);
    } else {
      setRecords(JSON.parse(local));
    }
  }, []);

  const sorted = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      ),
    [records]
  );

  function markSafe(r: RecordItem) {
    const updated = records.map(item =>
      item.id === r.id ? { ...item, status: 'safe' } : item
    );
    setRecords(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setSelected({ ...r, status: 'safe' });
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
        <Text style={styles.header}>My Records</Text>

        {sorted.map(r => (
          <TouchableOpacity
            key={r.id}
            style={styles.card}
            onPress={() => setSelected(r)}
          >
            <View>
              <Text style={styles.title}>{r.title}</Text>
              <Text style={styles.sub}>{r.circle}</Text>
            </View>
            <Text style={styles.date}>{formatDate(r.timestamp)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal */}
      {selected && (
        <View style={styles.modalWrap}>
          <View style={styles.overlay} onTouchEnd={() => setSelected(null)} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selected.title}</Text>
            <Text style={styles.sub}>{selected.circle}</Text>
            <Text style={styles.note}>
              {selected.notes || 'No additional details'}
            </Text>

            <View style={styles.modalRow}>
              {selected.status !== 'safe' && (
                <TouchableOpacity
                  style={styles.safeBtn}
                  onPress={() => markSafe(selected)}
                >
                  <Text style={styles.safeText}>Mark Safe</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelected(null)}
              >
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingBottom: 100,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111',
  },

  card: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 12, color: '#666', marginTop: 2 },
  date: { fontSize: 12, color: '#444' },

  modalWrap: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modal: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    zIndex: 10,
  },

  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  note: { marginTop: 10, fontSize: 14, color: '#444' },

  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },

  safeBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 10,
  },

  safeText: { color: '#fff', fontWeight: 'bold' },

  closeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
});
