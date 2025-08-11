import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CustomHeadingProps {
  color: string;
  heading1: string;
  heading2: string;
  subheading: string;
}

const ACCENT = '#03BFB5';

export default function CustomHeading({ color, heading1, heading2, subheading }: CustomHeadingProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color }]}>
        {heading1}
        <Text style={styles.accentText}>{heading2}</Text>
      </Text>
      <Text style={[styles.subheading, { color }]}>{subheading}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  accentText: {
    color: ACCENT,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
}); 