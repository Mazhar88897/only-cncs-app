import { Feather } from '@expo/vector-icons';
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

export default function NewPasswordScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const insets = useSafeAreaInsets();
  const { toast, showSuccess, hideToast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  const handleSetNewPassword = async () => {
    // Validate form
    if (!formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const resetToken = await AsyncStorage.getItem('resetToken');
      console.log('Retrieved reset token:', resetToken);

      if (!resetToken) {
        setError('Reset token not found. Please try the forgot password process again.');
        return;
      }

      console.log('Calling resetPassword API with:', { 
        newPassword: formData.newPassword, 
        resetToken: resetToken.substring(0, 20) + '...' 
      });

      await api.resetPassword(formData.newPassword, resetToken);
      console.log('Password reset successful');

      // Clear reset token
      await AsyncStorage.removeItem('resetToken');
      
      showSuccess('Password reset successful! You can now log in with your new password.');
      
      // Navigate to login after a short delay
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
      
    } catch (err) {
      console.error('Reset password error:', err);
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
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>
            <Text style={styles.subtitle}>
              Password must be strong.
            </Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#888"
                  value={formData.newPassword}
                  onChangeText={(value) => handleChange('newPassword', value)}
                  secureTextEntry={!isNewPasswordVisible}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  disabled={isLoading}
                >
                  <Feather name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#888" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.inputLabel}>Confirm Password:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#888"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
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
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.setPasswordButton, isLoading && styles.buttonDisabled]} 
                onPress={handleSetNewPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#004146" size="small" />
                ) : (
                  <Text style={styles.setPasswordButtonText}>Set New Password</Text>
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
    fontWeight: '600',
    marginBottom: 24,
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
    textAlign: 'center',
    fontWeight: '500',
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 2,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setPasswordButton: {
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
  setPasswordButtonText: {
    color: '#004146',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 