import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import ReportIssueButton from '../../components/ReportIssueButton';

const VIDEO_WIDTH = Dimensions.get('window').width - 48;
const VIDEO_HEIGHT = VIDEO_WIDTH * 9 / 16;
const ACCENT = '#004146';

export default function HowToUseScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { 
        backgroundColor: '#004146', 
        elevation: 0, 
        ...Platform.select({
          ios: { shadowOpacity: 0 },
          android: { elevation: 0 },
          web: { boxShadow: 'none' }
        }),
        borderBottomWidth: 0 
      },
    });
  }, [navigation]);

  return (
    <View style={{backgroundColor: '#004146', flex: 1}}>
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(48, insets.bottom + 48) }
      ]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      
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
    </ScrollView>
    
    {/* Report Issue Button - Absolutely positioned */}
    <ReportIssueButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#004146', 
    alignItems: 'center', 
    padding: 24,
  },
  logo: { marginBottom: 16, alignSelf: 'center' },
     title: {
     color: 'white',
     fontSize: 24,
     fontWeight: 'bold',
     marginBottom: 10,
     textAlign: 'center',
     marginTop: 20,
   },
   titleAccent: {
     color: '#03BFB5',
   },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'left',
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
    marginBottom: 4,
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
}); 