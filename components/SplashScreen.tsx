import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const fadeAnim = new Animated.Value(1);

  const screens = [
    {
      id: 'main',
      duration: 2000, // Reduced from 3000ms to 2000ms for smoother transition
      content: (
        <View style={styles.screenContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      )
    }
  ];

  useEffect(() => {
    const showScreen = (index: number) => {
      if (index >= screens.length) {
        onFinish();
        return;
      }

      setCurrentScreen(index);
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, // Reduced from 500ms for smoother transition
        useNativeDriver: true,
      }).start();

      // Wait for duration then fade out and finish
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300, // Reduced from 500ms for smoother transition
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, screens[index].duration);
    };

    showScreen(0);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        {screens[currentScreen].content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004146',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoImage: {
    width: width * 0.6, // Adjusted for logo.png proportions
    height: height * 0.3, // Adjusted to maintain proper aspect ratio
    marginBottom: 20,
    // Note: Using logo.png since Frame 143724539 (2).png has special characters that Metro can't handle
  },
}); 