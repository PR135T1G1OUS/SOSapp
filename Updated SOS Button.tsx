// SOSButtonPage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { PanResponder } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SOSButtonPage() {
  const [cursor, setCursor] = useState({ x: width / 2, y: height / 2 });
  const particles = useRef<{ x: number; y: number; size: number }[]>([]);

  // Generate initial particles
  useEffect(() => {
    particles.current = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
    }));
  }, []);

  // Animate particles
  useEffect(() => {
    const interval = setInterval(() => {
      particles.current = particles.current.map(p => ({
        ...p,
        x: p.x + (Math.random() - 0.5) * 2 + (cursor.x - width / 2) * 0.01,
        y: p.y + (Math.random() - 0.5) * 2 + (cursor.y - height / 2) * 0.01,
      }));
    }, 30);
    return () => clearInterval(interval);
  }, [cursor]);

  // Track touch/mouse movement
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setCursor({ x: gestureState.moveX, y: gestureState.moveY });
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Background Particles */}
      {particles.current.map((p, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: 'rgba(0,200,255,0.5)',
          }}
        />
      ))}

      {/* SOS Button */}
      <View style={styles.centerContainer}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => alert('SOS Triggered!')}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // dark base so particles show
  },
  centerContainer: {
    position: 'absolute',
    top: height / 2 - 40,
    left: width / 2 - 40,
  },
  sosButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 10,
  },
  sosText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
