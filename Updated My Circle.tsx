import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
  Dimensions,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

interface Member {
  id: string;
  name: string;
  phone: string;
}

const STORAGE_KEY = '@CIRCLE_MEMBERS_V2';
const { width, height } = Dimensions.get('window');

export default function MyCircleScreen() {
  const route = useRoute<any>();
  const { circleId, circleName } = route.params;

  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  /* ---------------- BACKGROUND ---------------- */
  const particles = useRef<{ x: number; y: number; s: number }[]>([]);
  const [cursor, setCursor] = useState({ x: width / 2, y: height / 2 });

  useEffect(() => {
    particles.current = Array.from({ length: 40 }).map(() => ({
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
    loadMembers();
  }, []);

  async function loadMembers() {
    const saved = await AsyncStorage.getItem(STORAGE_KEY + circleId);
    if (saved) setMembers(JSON.parse(saved));
  }

  async function saveMembers(newMembers: Member[]) {
    setMembers(newMembers);
    await AsyncStorage.setItem(
      STORAGE_KEY + circleId,
      JSON.stringify(newMembers)
    );
  }

  function addMember() {
    if (!name.trim() || !phone.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name,
      phone,
    };
    saveMembers([...members, newMember]);
    setName('');
    setPhone('');
    setShowModal(false);
  }

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
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

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>{circleName || 'My Circle'}</Text>
        <MaterialIcons name="group" size={24} color="#111" />
      </View>

      {/* List */}
      <FlatList
        data={members}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No members yet. Add one to get started.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <Ionicons
                name="person-circle"
                size={42}
                color="#444"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberPhone}>{item.phone}</Text>
              </View>
            </View>

            <TouchableOpacity>
              <Ionicons name="call" size={22} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Member</Text>

            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={addMember}>
              <Text style={styles.saveBtnText}>Add Member</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },

  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255,0,0,0.25)',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  header: { fontSize: 24, fontWeight: 'bold', color: '#111' },

  memberCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  memberName: { fontSize: 17, fontWeight: '600' },
  memberPhone: { color: '#555', fontSize: 13 },

  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 30,
  },

  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#ff4444',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },

  input: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },

  saveBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  cancelText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
  },
});
