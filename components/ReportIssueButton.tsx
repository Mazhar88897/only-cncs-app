import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportModal from './ReportModal';

interface ReportIssueButtonProps {
  absolute?: boolean; // Whether to use absolute positioning
}

export default function ReportIssueButton({ absolute = true }: ReportIssueButtonProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} style={[
        styles.button,
        absolute ? styles.absoluteButton : styles.inlineButton,
        absolute && { bottom: Math.max(16, insets.bottom + 16) }
      ]}>
        <Text style={styles.text}>Report an Issue?</Text>
      </TouchableOpacity>
      <ReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Math.max(16, screenWidth * 0.04), // 4% of screen width, minimum 16
    paddingVertical: Math.max(8, screenHeight * 0.01), // 1% of screen height, minimum 8
    borderRadius: 2,
    zIndex: 1000,
  },
  absoluteButton: {
    position: 'absolute',
    right: Math.max(4, screenWidth * 0.01), // 1% of screen width, minimum 4
  },
  inlineButton: {
    alignSelf: 'flex-end',
    
    
   
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    color: 'white',
    fontSize: Math.max(14, screenWidth * 0.035), // 3.5% of screen width, minimum 14
    fontWeight: 'bold',
  },
});