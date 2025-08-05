import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';
import CustomHeading from '../../components/CustomHeading';
import ResourceCard from '../../components/ResourceCard';

const ACCENT = '#03BFB5';

export default function MoreCNCResourcesScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: '#004146', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
    });
  }, [navigation]);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Logo width={180} height={70} style={styles.logo} />
        <CustomHeading
          color="white"
          heading1="More CNC "
          heading2="Resources"
          subheading="A selection of great CNC resources to purchase from and excellent CNC related channels."
        />

        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.welcomeTitle}>
            Welcome to <Text style={styles.accentText}>CNCs Only</Text>
          </Text>
          <Text style={styles.welcomeText}>
            Frustrated with poor material with breaking bits, ruining stock, and time wasted on unreliable feeds and
            speeds charts, we built the ultimate CNC machining calculator. Whether you're cutting for fun, profit, or
            both, we believe you deserve pro-level results without needing a machining degree. Built for hobbyists,
            refined for precision.
          </Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Our <Text style={styles.accentText}>Mission</Text>
          </Text>
          <Text style={styles.missionText}>
            To empower the desktop CNC community with tools that take the guesswork out of machining — and put the
            creativity back in.
          </Text>
        </View>

        {/* Stores and Resources Section */}
        <View style={styles.section}>
          <CustomHeading
            color="white"
            heading1="Stores and resource "
            heading2="platforms"
            subheading="A selection of great CNC resources to purchase from and excellent CNC related channels."
          />

          <View style={styles.cardsContainer}>
            <ResourceCard
              title="CNCWITHME"
              subtitle="Weekly project files and tutorials."
              description="The easiest way to expand your project library, get support, and streamline shop time. Sharpen your skills no matter your level."
              url="https://cncwithme.com"
              discountCode="JAMESDEANDESIGNS"
            />

            <ResourceCard
              title="Carveco CNC Software"
              subtitle="90 Day free trial of Carveco Maker"
              description="Unlimited use for 90 days of one of the best CAD/CAM softwares available for CNC and makers. (Note: You will NOT be charged during your trial)"
              url="https://account.carveco.com/purchase/MAK-S-12D?promoCode=PROMO-JamesDean90"
            />

            <ResourceCard
              title="Jenny Bits"
              subtitle="Best CNC bits available!"
              description="A selection of some of the best and innovative CNC bits on the market from Cadence Manufacturing."
              url="https://www.cadencemfgdesign.com/?ref=JDDesigns"
              discountCode="JAMESDEANDESIGNS"
            />

            <ResourceCard
              title="IDC Woodcraft"
              subtitle="CNC accessories and bits"
              description="A wide selection of CNC related accessories and bits for beginners."
              url="https://idcwoodcraft.com/"
              discountCode="*COMING SOON*"
            />
          </View>
        </View>

        {/* YouTube Channels Section */}
        <View style={styles.section}>
          <Text style={styles.youtubeTitle}>
            Best <Text style={styles.accentText}>CNC YouTube channels</Text> for tutorials and projects
          </Text>

          <View style={styles.channelList}>
            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@HamiltonDilbeck')}>
              <Text style={styles.channelItem}>
                1. Hamilton Dilbeck - <Text style={styles.linkText}>https://www.youtube.com/@HamiltonDilbeck</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@JamesDeanDesigns')}>
              <Text style={styles.channelItem}>
                2. James Dean Designs - <Text style={styles.linkText}>https://www.youtube.com/@JamesDeanDesigns</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@IDCWoodcraft')}>
              <Text style={styles.channelItem}>
                3. IDC Woodcraft - <Text style={styles.linkText}>https://www.youtube.com/@IDCWoodcraft</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@techydiy')}>
              <Text style={styles.channelItem}>
                4. TechyDIY - <Text style={styles.linkText}>https://www.youtube.com/@techydiy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@cutting-it-close')}>
              <Text style={styles.channelItem}>
                5. Cutting It Close - <Text style={styles.linkText}>https://www.youtube.com/@cutting-it-close</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@SothpawDesigns')}>
              <Text style={styles.channelItem}>
                6. Southpaw CNC & Woodworking - <Text style={styles.linkText}>https://www.youtube.com/@SothpawDesigns</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleLinkPress('https://www.youtube.com/@stlwoodworking')}>
              <Text style={styles.channelItem}>
                7. STL Woodworking - <Text style={styles.linkText}>https://www.youtube.com/@stlwoodworking</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#004146',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logo: { 
    marginBottom: 16, 
    alignSelf: 'center', 
    marginTop: 16 
  },
  section: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  missionText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  accentText: {
    color: ACCENT,
  },
  cardsContainer: {
    marginTop: 20,
  },
  youtubeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  channelList: {
    marginTop: 16,
  },
  channelItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  linkText: {
    color: ACCENT,
    textDecorationLine: 'underline',
  },
}); 