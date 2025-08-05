import Logo from '@/assets/images/logo.svg';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { api } from '../../lib/api';

export default function LoginScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [remember, setRemember] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        Alert.alert(
          'Success!',
          'Login successful!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({ email: '', password: '' });
                // Navigate to main app
                router.replace('/(tabs)');
              },
            },
          ]
        );
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Logo width={180} height={70} style={styles.logo} />
        <Text style={styles.title1}>
        Dial in your desktop CNC
       
        </Text>
                 <Text style={styles.title2}>  Easier cutting starts here </Text> 
        <View style={{ width: 320}}>
          <View style={styles.accountPrompt}>
           <Text style={styles.accountPromptText}>Click here to </Text>
           <Link href="/(auth)/create-account" asChild>
             <TouchableOpacity>
               <Text style={styles.createAccountLink}>create an account</Text>
             </TouchableOpacity>
           </Link>
         </View>
         
         <Text style={styles.loginInstruction}>Already have an account? Log in below.</Text>
         </View> 
         
         {error ? (
           <View style={styles.errorContainer}>
             <Text style={styles.errorText}>{error}</Text>
           </View>
         ) : null}

         <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#888"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
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
          <View style={styles.rememberRow}>
            <TouchableOpacity 
              onPress={() => setRemember(!remember)} 
              style={styles.checkbox}
              disabled={isLoading}
            >
              {remember && <View style={styles.checkboxInner} />}
            </TouchableOpacity>
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={{width: 320, alignItems: 'flex-end'}}>
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>
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
    flex: 1,
    
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title1: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    width: 320,

  },
     title2: {
     fontSize: 24,
     color: '#03BFB5',
     textAlign: 'center',
     fontWeight: 'bold',
     marginBottom: 28,
     width: 320,
   },
   accountPrompt: {
     flexDirection: 'row',
     
     
   },
   accountPromptText: {
     color: 'white',
     fontSize: 16,
   },
   createAccountLink: {
     color: '#03BFB5',
     fontSize: 16,
     fontWeight: 'bold',
   },
   loginInstruction: {
     color: 'white',
     fontSize: 14,
    
     marginBottom: 20,
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
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
    borderRadius: 1,
  },
  rememberText: {
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    width: 320,
    height: 48,
    backgroundColor: '#03BFB5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
   
  },
  signUpRow: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  signUpText: {
    color: 'white',
    fontSize: 16,
  },
  signUpLink: {
    color: '#03BFB5',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 