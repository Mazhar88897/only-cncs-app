import { Button } from '@/components/ui/button';
import { Theme } from '@/lib/theme';
import { createBox, createText } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

const Box = createBox<Theme>();
const Text = createText<Theme>();

export default function HomeScreen() {
  return (
    <Box flex={1} backgroundColor="background" padding="m">
      <Box marginBottom="l">
        <Text variant="header" color="foreground">
          Welcome!
        </Text>
        <Text variant="body" color="mutedForeground" marginTop="s">
          This is your new app with shadcn-like styling
        </Text>
      </Box>

      <Box gap="m">
        <Button onPress={() => {}} variant="default">
          Default Button
        </Button>
        
        <Button onPress={() => {}} variant="secondary">
          Secondary Button
        </Button>
        
        <Button onPress={() => {}} variant="outline">
          Outline Button
        </Button>
        
        <Button onPress={() => {}} variant="destructive">
          Destructive Button
        </Button>
        
        <Button onPress={() => {}} variant="ghost">
          Ghost Button
        </Button>
        
        <Button onPress={() => {}} variant="link">
          Link Button
        </Button>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({});
