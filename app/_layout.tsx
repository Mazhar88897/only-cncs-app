import theme from '@/lib/theme';
import { ThemeProvider } from '@shopify/restyle';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTintColor: theme.colors.foreground,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
