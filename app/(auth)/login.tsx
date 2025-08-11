import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast, showSuccess, showError, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  // Check if user is already logged in on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // User is already logged in, redirect to main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async () => {
    // Validate form
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const data = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      // Store user data in AsyncStorage
      try {
        await AsyncStorage.setItem('email', data.user.email);
        await AsyncStorage.setItem('id', data.user.id.toString());
        await AsyncStorage.setItem('name', data.user.name);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('Authorization', `Bearer ${data.token}`);
        await AsyncStorage.setItem('UserData', JSON.stringify(data.user));
        
        // Log the stored data
        console.log('Stored email:', data.user.email);
        console.log('Stored id:', data.user.id);
        console.log('Stored name:', data.user.name);
        console.log('Stored token:', data.token);
        
        // Show success message
        showSuccess('Login successful!');
        
        // Reset form
        setFormData({ email: '', password: '' });
        
        // Navigate to main app after a short delay
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      } catch (storageError) {
        console.error('Error storing user data:', storageError);
        setError('Error saving login data. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
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
            <Text style={styles.title}>Sign in to OnlyCNCs</Text>
            
            <View style={styles.accountPrompt}>
              <Text style={styles.accountPromptText}>Click here to </Text>
              <Link href="/(auth)/create-account" asChild>
                <TouchableOpacity>
                  <Text style={styles.createAccountLink}>create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <Text style={styles.subtitle}>Already have an account? Log in below.</Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
              
              <Text style={styles.inputLabel}>Password:</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
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
            </View>
            
            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            {/* Action buttons side by side */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.signInButton, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#0f766e" size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
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
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    color: 'white',
    fontSize: 12,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  accountPrompt: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  accountPromptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountLink: {
    color: '#03BFB5',
    fontSize: 16,
    fontWeight: 'bold',
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
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    height: 40,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 2,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#0f766e',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0f766e',
    borderRadius: 2,
    paddingHorizontal: 16,
    height: 40,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f766e',
  },

  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingTop: 8,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButton: {
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minWidth: 120,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 