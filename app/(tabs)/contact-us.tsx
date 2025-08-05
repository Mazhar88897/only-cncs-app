import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import Logo from '../../assets/images/logo.svg';
export default function ContactUsScreen() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set email from sessionStorage after component mounts (client-side only)
  useEffect(() => {
    // For React Native, we'll use AsyncStorage or similar
    // For now, we'll leave this empty as React Native doesn't have sessionStorage
    // You can implement this with @react-native-async-storage/async-storage if needed
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/contact-us', formData);
      
      // Show success alert
      Alert.alert(
        'Success!',
        'Your message has been sent successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form after successful submission
              setFormData({ name: '', subject: '', message: '', email: '' });
            },
          },
        ]
      );
    } catch (error) {
      // Show error alert
      Alert.alert(
        'Error!',
        error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        [{ text: 'OK' }]
      );
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
       <Logo width={180} height={70} style={styles.logo} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Contact <Text style={styles.titleAccent}>Us</Text>
          </Text>
          {/* <Text style={styles.subtitle}>
            Get in touch with us
          </Text> */}
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
                textAlignVertical="top"
                editable={!isLoading}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: { marginBottom: 16, alignSelf: 'center', marginTop: 16 },
  container: {
    flexGrow: 1,
    backgroundColor: '#004146',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  titleAccent: {
    color: '#03BFB5',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
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
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#03BFB5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 