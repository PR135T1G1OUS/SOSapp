// ChangePicturePage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, PanResponder } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ChangePicturePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cursor, setCursor] = useState({ x: width / 2, y: height / 2 });

  const particles = useRef<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    particles.current = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
    }));
  }, []);

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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setCursor({ x: gestureState.moveX, y: gestureState.moveY });
      },
    })
  ).current;

  const handleSelectImage = () => {
    alert('Image selection placeholder!');
  };

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

      <View style={styles.content}>
        <Text style={styles.title}>Change Profile Picture</Text>
        <TouchableOpacity onPress={handleSelectImage} style={styles.avatarContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Select Image</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => alert('Saved!')}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: {
    position: 'absolute',
    top: height / 4,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
