import Logo from '@/assets/images/logo.svg';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
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
  View
} from 'react-native';

export default function CreateAccountScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError('');
  };

  const handleSignUp = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      console.log('Response headers:', response.headers);
      
      // Check if response has content
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text that failed to parse:', responseText);
        setError('Invalid response from server');
        return;
      }
      
      console.log('Parsed data:', data);
      
      if (!response.ok) {
        setError(data.error || data.message || 'Registration failed');
        console.log('Error from server:', data.error || data.message);
        await AsyncStorage.setItem('signupEmail', formData.email);
        await AsyncStorage.setItem('signupName', formData.name);
        await AsyncStorage.setItem('signupPassword', formData.password);
        return;
      }

      // Store email for OTP verification
      
      
      Alert.alert(
        'Success!',
        'Account created successfully! Please verify your email with the OTP sent to your inbox.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(auth)/verify-otp');
            },
          },
        ]
      );
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Logo width={180} height={70} style={styles.logo} />
        
        <Text style={styles.title}>Create an OnlyCNCs account</Text>
        <Text style={styles.subtitle}>Fill in the details below and sign up.</Text>
        
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
            editable={!isLoading}
          />
          
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
          
          <Text style={styles.inputLabel}>Confirm Password:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password again"
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
        
                 <View style={styles.signInContainer}>
           <Link href="/(auth)/login" asChild>
             <TouchableOpacity style={styles.signInLink}>
               <Text style={styles.signInText}>Already have an account? Sign In</Text>
             </TouchableOpacity>
           </Link>
         </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 8,
    width: 320,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'left',
    marginBottom: 24,
    width: 320,
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: 320,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: 320,
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
     signInContainer: {
     width: 320,
     marginBottom: 24,
   },
   signInLink: {
     marginBottom: 24,
   },
  signInText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 320,
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
    backgroundColor: '#03BFB5',
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 