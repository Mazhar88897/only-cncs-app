import theme from '@/lib/theme';
import { ThemeProvider } from '@shopify/restyle';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useEffect(() => {
    // Hide the splash screen after the app is ready
    const hideSplash = async () => {
      await SplashScreen.hideAsync();
    };
    
    // Add a small delay to ensure the app is fully loaded
    const timer = setTimeout(hideSplash, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <Slot />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
