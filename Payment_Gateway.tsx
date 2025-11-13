import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';

export default function PaymentGatewayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { planId, amount, planName } = useLocalSearchParams();

  const stripe = useStripe();

  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simple form validation
  const validate = () => {
    if (!cardholderName.trim()) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setIsProcessing(true);

    try {
      // 1️⃣ Request a PaymentIntent client secret from your Firebase Function
      const response = await fetch(
        'https://us-central1-YOUR_FIREBASE_PROJECT.cloudfunctions.net/createPaymentIntent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency: 'usd' }),
        }
      );

      const data = await response.json();
      if (!data.clientSecret) throw new Error('No clientSecret returned');

      // 2️⃣ Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment(data.clientSecret, {
        type: 'Card',
        billingDetails: { name: cardholderName },
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 3️⃣ Update Firestore user record after successful payment
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            isPremium: true,
            premiumPlan: planId,
            premiumStartDate: new Date(),
            lastPaymentAmount: amount,
            lastPaymentDate: new Date(),
          });
        }

        Alert.alert(
          'Payment Successful 🎉',
          `You are now a premium member!\n\nPlan: ${planName}\nAmount: K${amount}`,
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/profile') }]
        );
      } else {
        Alert.alert('Payment not completed', 'Please try again.');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'Something went wrong during payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => router.back();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Plan Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plan</Text>
          <Text style={styles.summaryValue}>{planName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>K{amount}</Text>
        </View>
      </View>

      {/* Payment Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Card Details</Text>

        {/* Cardholder Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor="#bbb"
            value={cardholderName}
            onChangeText={setCardholderName}
            editable={!isProcessing}
          />
        </View>

        {/* Card Input Field */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Card Info</Text>
          <CardField
            postalCodeEnabled={false}
            placeholder={{ number: '4242 4242 4242 4242' }}
            cardStyle={{
              backgroundColor: '#f1f3f6',
              textColor: '#000',
            }}
            style={{ width: '100%', height: 50, marginVertical: 10 }}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={isProcessing}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}>
          <Text style={styles.payButtonText}>
            {isProcessing ? 'Processing...' : `Pay K${amount}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <MaterialCommunityIcons name="lock" size={16} color="#666" />
        <Text style={styles.footerText}>Your payment is securely processed via Stripe</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryCard: {
    margin: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 },
  formContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#666' },
  payButton: { backgroundColor: '#4CAF50' },
  payButtonDisabled: { backgroundColor: '#A5D6A7' },
  payButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  footerText: { fontSize: 12, color: '#666', fontStyle: 'italic' },
});
