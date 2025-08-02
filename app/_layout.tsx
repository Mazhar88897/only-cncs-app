import CustomSplashScreen from '@/components/SplashScreen';
import theme from '@/lib/theme';
import { ThemeProvider } from '@shopify/restyle';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    // Hide the splash screen after the app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    // Add a small delay to ensure the app is fully loaded
    const timer = setTimeout(hideSplash, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    setIsSplashComplete(true);
  };

  if (!isSplashComplete) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <Slot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
