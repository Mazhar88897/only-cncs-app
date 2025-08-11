import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

export default function VerifyOTPScreen() {
  const formWidth = screenWidth - 48;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Get email from AsyncStorage
    const getEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('signupEmail');
        console.log('Retrieved signup email:', email);
        if (email) {
          setSignupEmail(email);
          const name = await AsyncStorage.getItem('signupName');
          const password = await AsyncStorage.getItem('signupPassword');
          setSignupName(name || '');
          setSignupPassword(password || '');
          console.log('Retrieved signup data:', { email, name, password: password ? '***' : 'not set' });
        } else {
          console.log('No signup email found in AsyncStorage');
        }
      } catch (error) {
        console.log('Error getting email:', error);
      }
    };
    getEmail();

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const otpString = otp.join('');
    console.log('Submitting OTP verification:', { email: signupEmail, otp: otpString });
    
    if (otpString.length !== 6) {
      showError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    if (!signupEmail) {
      showError('Email is required');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Calling signupVerifyOtp API with:', { email: signupEmail, otp: otpString });
      const data = await api.signupVerifyOtp(signupEmail, otpString);
      console.log('Signup verification successful:', data);

      // Store user data in AsyncStorage
      try {
        await AsyncStorage.setItem('email', data.user.email);
        await AsyncStorage.setItem('id', data.user.id.toString());
        await AsyncStorage.setItem('name', data.user.name);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('Authorization', `Bearer ${data.token}`);
        await AsyncStorage.setItem('UserData', JSON.stringify(data.user));
        
        // Clear signup email
        await AsyncStorage.removeItem('signupEmail');
        await AsyncStorage.removeItem('signupName');
        await AsyncStorage.removeItem('signupPassword');
        
        console.log('User data stored successfully');
        
        showSuccess('Account verified successfully!');
        
        // Navigate to login after a short delay
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1500);

      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        showError('Error saving verification data. Please try again.');
      }
    } catch (err) {
      console.error('Signup verification error:', err);
      showError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      console.log('Resending OTP for email:', signupEmail);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL || 'https://backend.smartcnc.site/api'}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          name: signupName,
          password: signupPassword
        }),
      });

      const data = await response.json();
      console.log('Resend OTP response:', data);

      if (!response.ok) {
        showError(data.error || 'Failed to resend OTP');
        setCanResend(true);
        return;
      }

      // Reset timer if successful
      setCanResend(false);
      setTimer(30);
      showSuccess('OTP resent successfully!');
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      showError(err instanceof Error ? err.message : 'An error occurred');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.container,
          { paddingTop: Math.max(24, insets.top + 24) } // Add safe area padding to container
        ]}
      >
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
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
            
            <View style={styles.otpContainer}>
              <Text style={styles.inputLabel}>Enter OTP:</Text>
              <View style={styles.otpInputContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(index, value)}
                    onKeyPress={(e) => handleKeyPress(index, e)}
                    keyboardType="numeric"
                    maxLength={1}
                    editable={!isLoading}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            <View style={styles.timerContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Resend OTP in {timer} seconds
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={isLoading}
                  style={styles.resendButton}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.verifyButton, isLoading && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0f766e" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
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
    marginTop: 40, // Reduced from 80 to make layout more compact
  },
  title: {
    fontSize: 20,
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left',
    marginBottom: 24,
    fontWeight: '600',
  },
  formCard: {
    width: Math.min(400, Math.max(320, screenWidth - 48)), // More responsive width
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignSelf: 'center',
  },
  otpContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Math.max(2, Math.min(6, (screenWidth - 48 - 60) / 5)), // Smaller gap to ensure single line
    flexWrap: 'nowrap', // Force single line
    paddingHorizontal: 4, // Reduced padding
  },
  otpInput: {
    width: Math.max(35, Math.min(45, (screenWidth - 48 - 40) / 6)), // Smaller width to ensure single line
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: Math.min(16, Math.max(12, (screenWidth - 48) / 30)), // Smaller font to fit
    fontWeight: 'bold',
    color: '#0f766e',
    borderWidth: 1,
    borderColor: '#0f766e',
    minWidth: 35, // Smaller minimum width
    flexShrink: 0, // Prevent shrinking
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 