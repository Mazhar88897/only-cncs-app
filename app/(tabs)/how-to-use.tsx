import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Logo from '../../assets/images/logo.svg';

const VIDEO_WIDTH = Dimensions.get('window').width - 48;
const VIDEO_HEIGHT = VIDEO_WIDTH * 9 / 16;
const ACCENT = '#004146';

export default function HowToUseScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#004146', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
    });
  }, [navigation]);

  return (
    <View style={{backgroundColor: '#004146'}}>
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Logo width={180} height={70} style={styles.logo} />
      <Text style={styles.title}>Getting Started with ONLY CNCs</Text>
      <Text style={styles.subtitle}>
        Learn how to make the most of your CNC learning experience.
      </Text>
      <View style={styles.videoContainer}>
        <WebView
          style={styles.webview}
          containerStyle={{ backgroundColor: 'transparent' }}
          source={{ uri: 'https://www.youtube.com/embed/bJsaR9-h26Y' }}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      </View>
      <Text style={styles.sectionHeader}>Welcome to ONLY CNCs</Text>
      <Text style={styles.paragraph}>
        ONLY CNCs is your comprehensive platform for CNC knowledge and resources. 
        Access guides, calculators, and more to help you master desktop CNC machining.
      </Text>
      <Text style={styles.sectionHeader}>Key Features</Text>
      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Feeds & Speeds Calculator</Text>
        <Text style={styles.featureDesc}>
          Instantly get recommended feeds and speeds for your CNC projects.
        </Text>
      </View>
      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Material Database</Text>
        <Text style={styles.featureDesc}>
          Browse and select from a wide range of materials with machining tips.
        </Text>
      </View>
      <View style={styles.featureBox}>
        <Text style={styles.featureTitle}>Guides & Tutorials</Text>
        <Text style={styles.featureDesc}>
          Step-by-step guides to help you get started and improve your skills.
        </Text>
      </View>
      <Text style={styles.sectionHeader}>Getting Started</Text>
      <Text style={styles.paragraph}>
        1. Explore the material database and guides.{'\n'}
        2. Use the feeds & speeds calculator for your project.{'\n'}
        3. Review tutorials for tips and best practices.{'\n'}
        4. Reach out via "Contact Us" for more help.
      </Text>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#004146', 
    alignItems: 'center', 
    padding: 24,
    paddingBottom: 48,
  },
  logo: { marginBottom: 16, alignSelf: 'center' },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  videoContainer: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#363636',
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  paragraph: {
    color: '#eee',
    fontSize: 15,
    marginBottom: 12,
    alignSelf: 'flex-start',
    lineHeight: 22,
  },
  featureBox: {
    backgroundColor: '#2a2a2a',
    borderLeftWidth: 4,
    borderLeftColor: '#44C09E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '100%',
  },
  featureTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  featureDesc: {
    color: '#ccc',
    fontSize: 14,
  },
}); 