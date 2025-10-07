import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [inviteEnabled, setInviteEnabled] = useState(true);

  const handleChangePicture = () => {
    router.push('/change-picture');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/80' }}
              style={styles.avatar}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.changePictureBtn} onPress={handleChangePicture}>
              <Text style={styles.changePictureText}>Change Picture</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Jabulani Kabwe</Text>
            <Text style={styles.joinDate}>Joined on 2023</Text>
            <Text style={styles.accountType}>Premium Account</Text>
            <Text style={styles.address}>Libala Stage 3, Lusaka</Text>
            <Text style={styles.city}>Lusaka</Text>
          </View>
        </View>
      </View>

      {/* Rest of your existing code remains the same... */}
      {/* Emergency Circle Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Circle</Text>
        <View style={styles.circleContainer}>
          <View style={styles.circleItem}>
            <Text style={styles.circleLabel}>Sibling</Text>
            <Text style={styles.circleMembers}>3 Members</Text>
          </View>
          <View style={styles.circleItem}>
            <Text style={styles.circleLabel}>Friends</Text>
            <Text style={styles.circleMembers}>8 Members</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.manageButton}>
          <Text style={styles.manageButtonText}>Manage +3</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy and Policy</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>My Record</Text>
          <Text style={styles.arrow}>{'>'}</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Invite</Text>
          <Switch
            value={inviteEnabled}
            onValueChange={setInviteEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={inviteEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>
            Become a member for extra security
          </Text>
          <Text style={styles.subscriptionPrice}>
            Monthly subscription for K50
          </Text>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Your existing styles remain the same...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
  },
  changePictureBtn: {
    marginTop: 8,
    padding: 4,
  },
  changePictureText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  city: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  circleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circleItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  circleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  circleMembers: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  manageButton: {
    backgroundColor: '#ff4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#999',
  },
  subscriptionCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subscriptionPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  subscribeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});