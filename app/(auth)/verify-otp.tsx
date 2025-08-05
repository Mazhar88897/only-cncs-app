import Logo from '@/assets/images/logo.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Get email from AsyncStorage
    const getEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('signupEmail');
        if (email) {
          setSignupEmail(email);
          const name = await AsyncStorage.getItem('signupName');
          const password = await AsyncStorage.getItem('signupPassword');
          setSignupName(name || '');
          setSignupPassword(password || '');
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
    setError('');
    setIsLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL || 'https://backend.smartcnc.site/api'}/auth/signup/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: otpString,
          email: signupEmail
        }),
      });

      const data = await response.json();
     
      if (!response.ok) {
        setError(data.error || 'OTP verification failed');
        return;
      }

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
        
        Alert.alert(
          'Success!',
          'Account verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                router.replace('/(auth)/login');
              },
            },
          ]
        );
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        setError('Error saving verification data. Please try again.');
      }
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

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        setCanResend(true);
        return;
      }

      // Reset timer if successful
      setCanResend(false);
      setTimer(30);
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
      <ScrollView contentContainerStyle={styles.container}>
        <Logo width={180} height={70} style={styles.logo} />
        
        <View style={styles.formPanel}>
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
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#004146',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    marginBottom: 24,
  },
  formPanel: {

    borderRadius: 12,
    padding: 24,
    width: 320,
    borderWidth: 2,
    borderColor: 'white',
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    marginBottom: 24,
  },
  errorContainer: {
    // backgroundColor: '#ff6b6b',
    // padding: 12,
    // borderRadius: 8,
    // marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
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
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004146',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
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
    color: '#03BFB5',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#004146',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 