import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportModal({ open, onClose }: ReportModalProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, showError, showSuccess, hideToast } = useToast();

  // Load email from AsyncStorage when modal opens
  useEffect(() => {
    if (open) {
      loadUserEmail();
    }
  }, [open]);

  const loadUserEmail = async () => {
    try {
      // Try different possible email keys
      const emailKeys = ['email', 'userEmail', 'signupEmail', 'forgotPasswordEmail'];
      
      for (const key of emailKeys) {
        const storedEmail = await AsyncStorage.getItem(key);
        console.log(`Checking ${key}:`, storedEmail);
        if (storedEmail) {
          setEmail(storedEmail);
          console.log('Email loaded from storage:', storedEmail);
          return;
        }
      }
      
      console.log('No email found in storage');
    } catch (error) {
      console.error('Error loading user email:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!email.trim() || !subject.trim() || !message.trim()) {
      showError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      console.log('Token available:', !!token);
      
      if (!token) {
        showError('Please login to send a report');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };
      
      console.log('Sending report with data:', requestBody);
      
      const response = await fetch('https://backend.smartcnc.site/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Report API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Report API error response:', errorData);
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: Failed to send report`);
      }

      const responseData = await response.json();
      console.log('Report API success response:', responseData);

      showSuccess('Your report has been sent successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Report error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send report. Please try again.';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubject('');
    setMessage('');
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView 
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Report An Issue</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Feather name="x" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.description}>
                Fill out the form below to report an issue or get help with your account.
              </Text>

              {/* Form Fields */}
              <View style={styles.formContainer}>
                {/* Email Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="jhondow@email.com"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Subject Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Subject</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Brief Description of your problem"
                    placeholderTextColor="#666"
                    value={subject}
                    onChangeText={setSubject}
                    autoCapitalize="words"
                  />
                </View>

                {/* Message Field */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Message</Text>
                  <TextInput
                    style={[styles.input, styles.messageInput]}
                    placeholder="Enter your message here..."
                    placeholderTextColor="#666"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                  style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
                  onPress={handleSendMessage}
                  disabled={isLoading}
                >
                  <Text style={styles.sendButtonText}>
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#004146',
    borderRadius: 2,
    padding: 20,
    width: screenWidth - 32, // Full width minus padding
    maxWidth: 400,
    maxHeight: screenHeight * 0.9, // 90% of screen height
    minHeight: 400,
    borderWidth: 4,
    borderColor: '#03BFB5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#20C997',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: 'white',
    marginBottom: 20,
    lineHeight: 18,
  },
  formContainer: {
    gap: 16,
  },
  fieldContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 2,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 44,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#20C997',
    borderRadius: 2,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 44,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 