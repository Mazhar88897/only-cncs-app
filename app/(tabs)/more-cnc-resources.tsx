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
      <Text style={styles.title}>More CNC Resources</Text>
      <Text style={styles.subtitle}>
        Expand your CNC knowledge with these trusted resources from around the web. Whether you're a beginner or a pro, these sites and channels offer valuable tips, tutorials, and community support.
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
      <Text style={styles.sectionHeader}>Top CNC Resources</Text>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>CNC Zone (Forum)</Text>
        <Text style={styles.resourceDesc}>The largest and most active CNC forum community online.</Text>
        <Text style={styles.resourceLink} onPress={() => {}}>https://www.cnczone.com/</Text>
      </View>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>NYC CNC (YouTube)</Text>
        <Text style={styles.resourceDesc}>High-quality CNC tutorials, shop tours, and machining tips.</Text>
        <Text style={styles.resourceLink} onPress={() => {}}>https://www.youtube.com/user/saunixcomp</Text>
      </View>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>Winston Moy (YouTube)</Text>
        <Text style={styles.resourceDesc}>CNC projects, reviews, and approachable guides for all levels.</Text>
        <Text style={styles.resourceLink} onPress={() => {}}>https://www.youtube.com/user/krayvis</Text>
      </View>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>Practical Machinist (Forum)</Text>
        <Text style={styles.resourceDesc}>Professional machinist community with active discussions and advice.</Text>
        <Text style={styles.resourceLink} onPress={() => {}}>https://www.practicalmachinist.com/</Text>
      </View>
      <View style={styles.resourceCard}>
        <Text style={styles.resourceTitle}>CNC Cookbook (Website)</Text>
        <Text style={styles.resourceDesc}>Extensive CNC guides, calculators, and articles for hobbyists and pros.</Text>
        <Text style={styles.resourceLink} onPress={() => {}}>https://www.cnccookbook.com/</Text>
      </View>
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
  resourceCard: {
    backgroundColor: '#173c3c',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resourceTitle: {
    color: '#44C09E',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  resourceDesc: {
    color: '#eee',
    fontSize: 14,
    marginBottom: 4,
  },
  resourceLink: {
    color: '#4ecdc4',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
}); 