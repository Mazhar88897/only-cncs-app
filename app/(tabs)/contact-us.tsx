import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import ReportIssueButton from '../../components/ReportIssueButton';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';

export default function ContactUsScreen() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: '',
  });
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Get email from AsyncStorage when component mounts
  useEffect(() => {
    const getUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Error getting email from storage:', error);
      }
    };
    getUserEmail();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputFocus = () => {
    // This will help with keyboard handling
    // The KeyboardAvoidingView will handle the rest
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      showError('Please fill in all required fields.');
      return;
    }

    // Check if user email is available
    if (!userEmail) {
      showError('User email not found. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/contact-us', {
        name: formData.name.trim(),
        email: userEmail.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      // Show success message
      showSuccess('Your message has been sent successfully!');
      
      // Reset form after successful submission
      setFormData({ name: '', subject: '', message: '' });
    } catch (error) {
      // Show error message
      showError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        enabled={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                Contact <Text style={styles.titleAccent}>Us</Text>
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  <Text style={styles.formTitleText}>Contact</Text> <Text style={styles.formTitleAccent}>us</Text>
                </Text>
                <Text style={styles.formSubtitle}>Let us know what you are thinking.</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Name:</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.inputDisabled]}
                    placeholder="Type your name here."
                    placeholderTextColor="#888"
                    value={formData.name}
                    onChangeText={(value) => handleChange('name', value)}
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={handleInputFocus}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Subject:</Text>
                  <TextInput
                    style={[styles.input, isLoading && styles.inputDisabled]}
                    placeholder="Brief Description of your message"
                    placeholderTextColor="#888"
                    value={formData.subject}
                    onChangeText={(value) => handleChange('subject', value)}
                    editable={!isLoading}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={handleInputFocus}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Message:</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, isLoading && styles.inputDisabled]}
                    placeholder="Type your message here."
                    placeholderTextColor="#888"
                    value={formData.message}
                    onChangeText={(value) => handleChange('message', value)}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isLoading}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onFocus={handleInputFocus}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Send</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <Toast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onHide={hideToast}
            />
            
            {/* Report Issue Button - Now positioned after the form */}
            <View style={styles.reportButtonContainer}>
              <ReportIssueButton absolute={false} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004146',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, // Reduced from 100px to 40px for better spacing
  },
  header: {
    alignItems: 'center',
    marginBottom: 24, // Reduced from 30px to 24px for better spacing
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    marginTop: 10,
    textAlign: 'center',
  },
  titleAccent: {
    color: '#03BFB5',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 32,
    marginBottom: 16, // Reduced from 20px to 16px for better spacing
    // Platform-specific shadow handling
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  formTitleText: {
    color: 'black',
  },
  formTitleAccent: {
    color: '#03BFB5',
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#03BFB5',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    // Platform-specific shadow handling
    ...Platform.select({
      ios: {
        shadowColor: '#03BFB5',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 4px rgba(3, 191, 181, 0.3)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  reportButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20, // Reduced from 40px to 20px for better spacing
  },
}); 