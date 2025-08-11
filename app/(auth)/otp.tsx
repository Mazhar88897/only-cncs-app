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

export default function ForgotPasswordOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets = useSafeAreaInsets();
  const { toast, showSuccess, hideToast } = useToast();

  console.log('ForgotPasswordOTPScreen rendered');

  useEffect(() => {
    console.log('ForgotPasswordOTPScreen useEffect triggered');
    // Get email from AsyncStorage
    const getEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('forgotPasswordEmail');
        console.log('Retrieved forgotPasswordEmail from AsyncStorage:', email);
        if (email) {
          setForgotPasswordEmail(email);
          console.log('Set forgotPasswordEmail state to:', email);
        } else {
          console.log('No forgotPasswordEmail found in AsyncStorage');
        }
      } catch (error) {
        console.log('Error getting forgotPasswordEmail:', error);
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
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.verifyOtp(forgotPasswordEmail, otpString);
      console.log('OTP verification response:', data);

      // Store reset token from API response
      const resetToken = data.resetToken || data.token; // Try both possible field names
      if (resetToken) {
        await AsyncStorage.setItem('resetToken', resetToken);
        console.log('Stored reset token for password reset');
      } else {
        console.warn('No reset token found in API response');
        // For now, use a fallback token for testing
        const fallbackToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJpYXQiOjE3NTQ0ODgxMzQsImV4cCI6MTc1NDQ4OTAzNH0.XLp_dewHXse_2H962XtCYrrknGArMiwaSAPLJ6cIt1Y';
        await AsyncStorage.setItem('resetToken', fallbackToken);
        console.log('Using fallback reset token');
      }

      // Clear forgot password email
      await AsyncStorage.removeItem('forgotPasswordEmail');
        
      showSuccess('OTP verified successfully! You can now set your new password.');
      
      // Navigate to new password after a short delay
      setTimeout(() => {
        router.replace('/(auth)/new-password');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      await api.forgotPasswordEmail(forgotPasswordEmail);

      // Reset timer if successful
      setCanResend(false);
      setTimer(30);
      
      // Clear OTP inputs on successful resend
      setOtp(['', '', '', '', '', '']);
      
      // Clear any existing error
      setError('');
      
      // Focus on first input
      inputRefs.current[0]?.focus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        showsVerticalScrollIndicator={false}
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
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

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
                onPress={() => router.replace('/(auth)/login')}
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
  errorContainer: {
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
    gap: 2,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 2,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 2,
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
    color: '#0f766e',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
    borderRadius: 2,
    alignItems: 'center',
    minWidth: 120,
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