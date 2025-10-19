// components/SOSButton.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
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

type Ripple = {
  id: number;
  progress: Animated.Value;
};

export default function SOSButton({ onSOSTriggered }: SOSButtonProps) {
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(3);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const rippleId = useRef(0);

  /** Countdown Logic */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (counting && count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else if (count === 0) {
      triggerSOS();
      setCounting(false);
    }
    return () => clearTimeout(timer);
  }, [counting, count]);

  /** Infinite pulse animation for SOS button */
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  /** Continuous ripple animation */
  useEffect(() => {
    if (!counting) {
      const rippleInterval = setInterval(createRipple, 2000);
      return () => clearInterval(rippleInterval);
    }
  }, [counting]);

  /** Start countdown */
  const startCountdown = () => {
    setCounting(true);
    setCount(3);
  };

  /** Create ripple animation */
  const createRipple = () => {
    const id = rippleId.current++;
    const progress = new Animated.Value(0);

    setRipples((prev) => [...prev, { id, progress }]);

    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    });
  };

  /** Cancel SOS */
  const cancelSOS = () => {
    setCounting(false);
    Toast.show({ type: 'info', text1: 'SOS Cancelled' });
  };

  /** Trigger SOS */
  const triggerSOS = async () => {
    Toast.show({ type: 'success', text1: 'Sending SOS...' });

    let rawLocation = null;
    try {
      rawLocation = await getCurrentLocation();
    } catch {
      Alert.alert('Warning', 'Unable to get location. SOS sent without location.');
    }

    const location = rawLocation
      ? {
          lat: rawLocation.lat,
          lng: rawLocation.lng,
          accuracy: rawLocation.accuracy ?? undefined,
        }
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
    }
  };

  /** Countdown overlay */
  if (counting) {
    return (
      <View style={styles.countdownOverlay as StyleProp<ViewStyle>}>
        <Text style={styles.countdownText as StyleProp<TextStyle>}>{count}</Text>
        <TouchableOpacity onPress={cancelSOS} style={styles.cancelButton as StyleProp<ViewStyle>}>
          <Text style={styles.cancelButtonText as StyleProp<TextStyle>}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /** Default SOS button with ripples */
  return (
    <View style={styles.buttonContainer as StyleProp<ViewStyle>}>
      {ripples.map((r) => (
        <Animated.View
          key={r.id}
          style={[
            styles.ripple as StyleProp<ViewStyle>,
            {
              transform: [
                {
                  scale: r.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 2.5],
                  }),
                },
              ],
              opacity: r.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 0],
              }),
            },
          ]}
        />
      ))}

      <Animated.View
        style={[
          styles.pulseRing as StyleProp<ViewStyle>,
          {
            transform: [
              {
                scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }),
              },
            ],
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
          },
        ]}
      />

      <TouchableOpacity
        onPress={startCountdown}
        style={styles.button as StyleProp<ViewStyle>}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText as StyleProp<TextStyle>}>SOS</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 0,
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  countdownText: {
    fontSize: 64,
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
