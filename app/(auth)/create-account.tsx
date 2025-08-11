import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

// Password Validation Component - matching Next.js version
const PasswordValidation = ({ password }: { password: string }) => {
  const requirements = [
    {
      id: 'length',
      label: 'Password must be at least 8 characters long',
      test: (pwd: string) => pwd.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Password must contain at least one uppercase letter',
      test: (pwd: string) => /[A-Z]/.test(pwd),
    },
    {
      id: 'lowercase',
      label: 'Password must contain at least one lowercase letter',
      test: (pwd: string) => /[a-z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'Password must contain at least one number',
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      id: 'special',
      label: 'Password must contain at least one special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    }
  ];

  if (!password) return null;

  return (
    <View style={styles.passwordValidationContainer}>
      <View style={styles.requirementsContainer}>
        {requirements.map((req) => {
          const isValid = req.test(password);
          return (
            <View key={req.id} style={styles.requirementRow}>
              <Text style={[styles.requirementIcon, { color: isValid ? '#4ade80' : '#f87171' }]}>
                {isValid ? '✓' : '✗'}
              </Text>
              <Text style={[styles.requirementText, { color: isValid ? '#4ade80' : '#f87171' }]}>
                {req.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function CreateAccountScreen() {
  const { width: screenWidth } = Dimensions.get('window');
  const formWidth = screenWidth - 48;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    message: ''
  });
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const { toast, showSuccess, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true, message: 'Password is strong' };
  };

  const validateField = (field: keyof typeof formData, value: string) => {
    switch (field) {
      case 'name':
        return value.trim().length >= 2 ? '' : 'Name must be at least 2 characters long';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Please enter a valid email address';
      case 'password':
        return validatePassword(value).isValid ? '' : 'Password does not meet requirements';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    if (error) setError('');

    // Validate password when password field changes
    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const getFieldError = (field: keyof typeof formData) => {
    if (!touchedFields[field]) return '';
    return validateField(field, formData[field]);
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.password.trim() && 
           formData.confirmPassword.trim() &&
           passwordStrength.isValid &&
           formData.password === formData.confirmPassword;
  };

  const handleSignUp = async () => {
    // Validate form
    if (!isFormValid()) {
      setError('Please fill in all fields correctly');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://backend.smartcnc.site/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
        }),
      });
      
      console.log('Response status:', response.status);
      
      // Check if response has content
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        setError('Invalid response from server');
        return;
      }
      
      console.log('Parsed data:', data);
      
      if (!response.ok) {
        setError(data.error || data.message || 'Registration failed');
        console.log('Error from server:', data.error || data.message);
        return;
      }

      // Store email for OTP verification
      await AsyncStorage.setItem('signupEmail', formData.email);
      await AsyncStorage.setItem('signupName', formData.name);
      await AsyncStorage.setItem('signupPassword', formData.password);
      console.log('Stored signup data for OTP verification:', { email: formData.email, name: formData.name });
      
      showSuccess('Account created successfully! Please verify your email with the OTP sent to your inbox.');
      
      // Navigate to OTP verification after a short delay
      setTimeout(() => {
        router.replace('/(auth)/verify-otp');
      }, 1500);
    } catch (err) {
      console.error('Network or other error:', err);
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.email || formData.password || formData.confirmPassword) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
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
        
        {/* Main content centered with proper spacing from logo */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { width: formWidth }]}>Create an OnlyCNCs account</Text>
          <View style={[styles.formCard, { width: formWidth }]}>
            <Text style={[styles.subtitle, { width: formWidth }]}>Fill in the details below and sign up.</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              onBlur={() => handleBlur('name')}
              editable={!isLoading}
              autoCapitalize="words"
            />
            {getFieldError('name') ? (
              <Text style={styles.fieldErrorText}>{getFieldError('name')}</Text>
            ) : null}
            
            <Text style={styles.inputLabel}>Email:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {getFieldError('email') ? (
              <Text style={styles.fieldErrorText}>{getFieldError('email')}</Text>
            ) : null}
            
            <Text style={styles.inputLabel}>Password:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#888"
                value={formData.password}
                onChangeText={(value) => handleChange('password', value)}
                onBlur={() => handleBlur('password')}
                secureTextEntry={!isPasswordVisible}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={isLoading}
              >
                <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <PasswordValidation password={formData.password} />
            {getFieldError('password') ? (
              <Text style={styles.fieldErrorText}>{getFieldError('password')}</Text>
            ) : null}
            
            <Text style={styles.inputLabel}>Confirm Password:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password again"
                placeholderTextColor="#888"
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange('confirmPassword', value)}
                onBlur={() => handleBlur('confirmPassword')}
                secureTextEntry={!isConfirmPasswordVisible}
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                disabled={isLoading}
              >
                <Feather name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#888" />
              </TouchableOpacity>
            </View>
            {getFieldError('confirmPassword') ? (
              <Text style={styles.fieldErrorText}>{getFieldError('confirmPassword')}</Text>
            ) : null}
          </View>
          
          <View style={styles.signInContainer}>
            <TouchableOpacity style={styles.signInLink} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.signUpButton, (!isFormValid() || isLoading) && styles.buttonDisabled]} 
              onPress={handleSignUp}
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.signUpButtonText}>Sign Up</Text>
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
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24, // Keep horizontal padding, remove vertical padding
    paddingBottom: 24, // Add bottom padding for scroll
  },
  logoContainer: {
    position: 'absolute',
    top: 24, // Base margin top
    left: 0,
    padding: 24,
    zIndex: 1, // Ensure logo stays on top
  },
  logo: {
    width: 100,
    height: 100,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 140, // Increase margin top to account for logo space and prevent overlap
  },
  title: {
    fontSize: 20,
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 4,
    maxWidth: 400,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'left',
    marginBottom: 24,
    maxWidth: 400,
    fontWeight: '600',
  },
  formCard: {
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'left',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  input: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  fieldErrorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordValidationContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  requirementsContainer: {
    gap: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 12,
    flex: 1,
  },
  signInContainer: {
    width: '100%',
    marginBottom: 16,
  },
  signInLink: {
    alignItems: 'center',
  },
  signInText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 24,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpButton: {
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
  signUpButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 