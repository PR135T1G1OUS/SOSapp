// components/SOSButton.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getCurrentLocation } from '../utils/location';
import { addSOS } from '../utils/db';
import { auth } from '../../firebaseConfig';

// UUID helper
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type SOSButtonProps = {
  onSOSTriggered: () => void;
};

export default function SOSButton({ onSOSTriggered }: SOSButtonProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [isSending, setIsSending] = useState(false);

  /** Infinite pulse animation for SOS button */
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  /** Trigger SOS */
  const triggerSOS = async () => {
    if (isSending) return;
    setIsSending(true);
    Toast.show({ type: 'success', text1: 'Sending SOS...' });

    let rawLocation = null;
    try {
      rawLocation = await getCurrentLocation();
    } catch {
      Toast.show({ type: 'info', text1: 'Location unavailable, sending anyway.' });
    }

    const location = rawLocation
      ? { lat: rawLocation.lat, lng: rawLocation.lng, accuracy: rawLocation.accuracy ?? undefined }
      : { lat: 0, lng: 0 };

    const sosPayload = {
      id: uuidv4(),
      userId: auth.currentUser?.uid || 'anonymous',
      createdAt: new Date().toISOString(),
      location,
      status: 'queued' as const,
      retryCount: 0,
    };

    try {
      await addSOS(sosPayload);
      onSOSTriggered();
      Toast.show({ type: 'success', text1: 'SOS Queued Locally' });
    } catch (err) {
      console.error('Error adding SOS:', err);
      Toast.show({ type: 'error', text1: 'Failed to queue SOS' });
    } finally {
      setTimeout(() => setIsSending(false), 2000);
    }
  };

  /** Animated pulse style */
  const animatedStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.15],
        }),
      },
    ],
    shadowOpacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={styles.buttonContainer as StyleProp<ViewStyle>}>
      <Animated.View style={[styles.pulseRing as StyleProp<ViewStyle>, animatedStyle]} />
      <TouchableOpacity
        onPress={triggerSOS}
        style={[styles.button as StyleProp<ViewStyle>, isSending && styles.disabledButton]}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText as StyleProp<TextStyle>}>
          {isSending ? 'Sending...' : 'SOS'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  disabledButton: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
});
