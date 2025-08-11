import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';

const { width: screenWidth } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { toast, showSuccess, hideToast } = useToast();

  const handleSendResetLink = async () => {
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      console.log('Sending forgot password email for:', email);
      await api.forgotPasswordEmail(email);
      console.log('Forgot password email sent successfully');
      
      // Store email in AsyncStorage for OTP verification
      await AsyncStorage.setItem('forgotPasswordEmail', email);
      console.log('Stored forgotPasswordEmail in AsyncStorage:', email);
      
      // Show success message
      showSuccess('Password reset link has been sent to your email.');
      
      // Navigate to OTP screen after a short delay
      setTimeout(() => {
        router.replace('/(auth)/otp');
      }, 1500);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={[
        styles.container,
        { paddingTop: Math.max(24, insets.top + 24) } // Add safe area padding to container
      ]}>
        {/* Logo in top-left */}
        <View style={[
          styles.logoContainer,
          { top: Math.max(24, insets.top + 24) } // Apply safe area insets dynamically
        ]}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Main content centered */}
        <View style={styles.contentContainer}>
          <View style={styles.formCard}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address to receive a password reset link.
            </Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            {/* Email Input with Label */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
            
            {/* Navigation Links */}
            <View style={styles.navigationLinks}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.navLink}>Back to Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/create-account')}>
                <Text style={styles.navLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
            
            {/* Divider Line */}
            <View style={styles.divider} />
            
            {/* Button Container - Cancel and Send OTP */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.sendOtpButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendResetLink}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#004146" size="small" />
                ) : (
                  <Text style={styles.sendOtpButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#004146',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24, // Keep horizontal padding, remove vertical padding
  },
  logoContainer: {
    position: 'absolute',
    top: 24, // Base margin top
    left: 0,
    padding: 24,
  },
  logo: {
    width: 120,
    height: 60,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80, // Add margin top to account for logo space
  },
  formCard: {
    width: Math.min(400, screenWidth - 48),
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignSelf: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 2,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 2,
    padding: 12,
    marginBottom: 24,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    textAlign: 'left',
  },
  navigationLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  navLink: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sendOtpButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  sendOtpButtonText: {
    color: '#004146',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 