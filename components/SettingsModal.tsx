import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfirmationModal from './ConfirmationModal';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const router = useRouter();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleResetSettingClick = () => {
    console.log('Reset Setting button pressed');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmReset = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL || 'https://backend.smartcnc.site/api'}/cnc/reset-preference`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to reset preferences');
        return;
      }
      
      // Reset remember choice
      await AsyncStorage.setItem('rememberChoice', 'false');
      await AsyncStorage.setItem('refreshTrigger', Date.now().toString());
      
      Alert.alert('Success', 'Settings reset successfully!');
      
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to reset settings. Please try again.');
    } finally {
      setIsConfirmModalOpen(false);
      onClose(); // Close settings modal
    }
  };

  const handleCancelReset = () => {
    setIsConfirmModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared');
      // Navigate to the login page
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  if (!open) return null;

  return (
    <>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Setting</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleResetSettingClick}
              >
                <Text style={styles.optionButtonText}>Reset Setting</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        open={isConfirmModalOpen}
        onClose={handleCancelReset}
        onConfirm={handleConfirmReset}
        title="Warning"
        message="Are you sure you want to Reset Setting?"
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
  },
  modalContainer: {
    backgroundColor: '#004851',
    borderWidth: 4,
    borderColor: '#03BFB5',
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: width - 48,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#03BFB5',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#03BFB5',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'left',
  },
  buttonContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#03BFB5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#03BFB5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#004851',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 