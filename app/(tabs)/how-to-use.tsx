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
    <View style={{backgroundColor: '#004146', flex: 1}}>
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Logo width={180} height={70} style={styles.logo} />
             <Text style={styles.title}>
         <Text style={styles.titleAccent}>How to </Text>Use
       </Text>      
      <Text style={styles.subtitle}>
      A quick video running through the simple steps of using this app.


      </Text>
      <View style={styles.videoContainer}>
        <WebView
          style={styles.webview}
          containerStyle={{ backgroundColor: 'transparent' }}
          source={{ uri: 'https://www.youtube.com/embed/9PdPAza1zEg' }}
          allowsFullscreenVideo
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      </View>
      <Text style={styles.sectionHeader}>What is <Text style={styles.titleAccent}>OnlyCNCs?</Text></Text>
      <Text style={styles.paragraph}>
      Frustrated with poor material with breaking bits, ruining stock, and time wasted on unreliable feeds and speeds charts, we built the ultimate CNC machining calculator. Whether you're cutting for fun, profit, or both, we believe you deserve pro-level results without needing a machining degree. Built for hobbyists, refined for precision.
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
   titleAccent: {
     color: '#03BFB5',
   },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
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