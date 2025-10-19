import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
/**
 * MyCircleScreen.tsx
 * ------------------
 * React Native implementation with Firebase integration
 * 
 * Firebase Structure:
 * users/{userId}/
 *   - name, email, phoneNumber, photoURL, etc.
 *   circles/{circleId}/
 *     - phoneNumber, name, category, profilePicture, isRegistered, addedAt
 */

// Types
type CircleCategory = 'Sibling' | 'Friends' | 'Family' | 'Emergency' | 'Other';

type CircleMember = {
  id: string;
  phoneNumber: string;
  name: string;
  category: CircleCategory;
  profilePicture?: string;
  isRegistered: boolean;
  addedAt: string;
};

type UserProfile = {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
};


// Firebase Service
class FirebaseService {
  static async fetchUserCircles(userId: string): Promise<CircleMember[]> {
    try {
      const circlesRef = collection(db, 'users', userId, 'circles');
      const snapshot = await getDocs(circlesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CircleMember[];
    } catch (error) {
      console.error('Error fetching circles:', error);
      throw error;
    }
  }

  static async findUserByPhone(phoneNumber: string): Promise<UserProfile | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', phoneNumber));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const userData = snapshot.docs[0].data();
      return {
        uid: snapshot.docs[0].id,
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
      };
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  static async addCircleMember(
    userId: string,
    member: Omit<CircleMember, 'id' | 'addedAt'>
  ): Promise<CircleMember> {
    try {
      const circlesRef = collection(db, 'users', userId, 'circles');
      const docRef = await addDoc(circlesRef, {
        ...member,
        addedAt: Timestamp.now(),
      });
      
      return {
        id: docRef.id,
        ...member,
        addedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  static async removeCircleMember(userId: string, memberId: string): Promise<void> {
    try {
      const memberRef = doc(db, 'users', userId, 'circles', memberId);
      await deleteDoc(memberRef);
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }
}

export default function MyCircleScreen() {
  const [circles, setCircles] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const currentUserId = 'user_202302738'; // Replace with actual auth user ID

  useEffect(() => {
    loadCircles();
  }, []);

  async function loadCircles() {
    setLoading(true);
    try {
      const data = await FirebaseService.fetchUserCircles(currentUserId);
      setCircles(data);
    } catch (error) {
      console.error('Failed to load circles:', error);
      Alert.alert('Error', 'Failed to load your circles');
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveMember(memberId: string) {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from your circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseService.removeCircleMember(currentUserId, memberId);
              setCircles(prev => prev.filter(m => m.id !== memberId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  }

  // Group circles by category
  const groupedCircles = circles.reduce((acc, member) => {
    if (!acc[member.category]) acc[member.category] = [];
    acc[member.category].push(member);
    return acc;
  }, {} as Record<CircleCategory, CircleMember[]>);

  const categories: CircleCategory[] = ['Sibling', 'Friends', 'Family', 'Emergency', 'Other'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Circle</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading circles...</Text>
          </View>
        ) : circles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No circle members yet</Text>
            <Text style={styles.emptySubtitle}>Add your first member to get started</Text>
          </View>
        ) : (
          <View style={styles.circlesContainer}>
            {categories.map(category => {
              const members = groupedCircles[category] || [];
              if (members.length === 0) return null;

              return (
                <View key={category} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      <Text style={styles.categorySubtitle}>
                        {members.length} {members.length === 1 ? 'Member' : 'Members'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.callButton}
                      onPress={() => Alert.alert('Call', `Call all ${category} members`)}
                    >
                      <Text style={styles.callIcon}>📞</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.membersRow}>
                    {members.slice(0, 3).map((member, index) => (
                      <TouchableOpacity
                        key={member.id}
                        style={[styles.memberAvatar, index > 0 && styles.memberAvatarOverlap]}
                        onLongPress={() => handleRemoveMember(member.id)}
                      >
                        {member.profilePicture ? (
                          <Image
                            source={{ uri: member.profilePicture }}
                            style={styles.avatarImage}
                          />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                              {member.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    
                    {members.length > 3 && (
                      <View style={[styles.memberAvatar, styles.countBadge]}>
                        <Text style={styles.countText}>+{members.length - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={async (member) => {
          try {
            const newMember = await FirebaseService.addCircleMember(currentUserId, member);
            setCircles(prev => [...prev, newMember]);
            setShowAddModal(false);
          } catch (error) {
            Alert.alert('Error', 'Failed to add member');
          }
        }}
      />
    </View>
  );
}

// Add Member Modal Component
function AddMemberModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (member: Omit<CircleMember, 'id' | 'addedAt'>) => Promise<void>;
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CircleCategory>('Friends');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSearchUser() {
    if (!phoneNumber.trim()) return;
    setSearching(true);
    try {
      const user = await FirebaseService.findUserByPhone(phoneNumber);
      setFoundUser(user);
      if (user) {
        setName(user.name);
      }
    } catch (error) {
      console.error('Error searching user:', error);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit() {
    if (!phoneNumber.trim() || !name.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      await onAdd({
        phoneNumber: phoneNumber.trim(),
        name: name.trim(),
        category,
        profilePicture: foundUser?.photoURL,
        isRegistered: !!foundUser,
      });
      // Reset form
      setPhoneNumber('');
      setName('');
      setFoundUser(null);
      setCategory('Friends');
    } finally {
      setSaving(false);
    }
  }

  const categories: CircleCategory[] = ['Sibling', 'Friends', 'Family', 'Emergency', 'Other'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Circle Member</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+260 965 502 028"
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={[styles.searchBtn, searching && styles.searchBtnDisabled]}
                  onPress={handleSearchUser}
                  disabled={searching}
                >
                  <Text style={styles.searchBtnText}>
                    {searching ? 'Searching...' : 'Search'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {foundUser && (
                <View style={styles.foundUserCard}>
                  <View style={styles.foundUserAvatar}>
                    {foundUser.photoURL ? (
                      <Image source={{ uri: foundUser.photoURL }} style={styles.foundUserImage} />
                    ) : (
                      <Text style={styles.foundUserText}>{foundUser.name.charAt(0)}</Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.foundUserName}>{foundUser.name}</Text>
                    <Text style={styles.foundUserStatus}>User found in system</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, foundUser && styles.inputDisabled]}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                editable={!foundUser}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Submit Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, saving && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={saving}
            >
              <Text style={styles.submitButtonText}>
                {saving ? 'Adding...' : 'Add Member'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  circlesContainer: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  callButton: {
    width: 44,
    height: 44,
    backgroundColor: '#EF4444',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberAvatarOverlap: {
    marginLeft: -12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
  },
  foundUserCard: {
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foundUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foundUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  foundUserText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  foundUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  foundUserStatus: {
    fontSize: 12,
    color: '#059669',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
