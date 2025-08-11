import { Feather } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../../assets/images/logo.svg';
import CustomDrawer from '../../components/CustomDrawer';
import ReportModal from '../../components/ReportModal';
import SettingsModal from '../../components/SettingsModal';

function CustomHeader({ navigation }: { navigation: any }) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSettingsPress = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <>
      <View style={[
        styles.headerContainer,
        { 
          paddingTop: Math.max(insets.top + 8, 40),
          height: Math.max(insets.top + 64, 104)
        }
      ]}>
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={styles.iconButton}
        >
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Logo width={180} height={70} />
        </View>
       
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleSettingsPress}
        >
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <SettingsModal 
        open={isSettingsModalOpen} 
        onClose={handleCloseSettings} 
      />
    </>
  );
}

export default function TabsLayout() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const handleReportPress = () => {
    setIsReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportModalOpen(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />,
          headerStyle: { backgroundColor: '#004146' },
        })}
      >
        <Drawer.Screen name="index" />
        <Drawer.Screen name="material" />
        <Drawer.Screen name="results" />
        <Drawer.Screen name="next" />
      </Drawer>
      {/* Removed floating Report an Issue button and its container */}
      <ReportModal 
        open={isReportModalOpen} 
        onClose={handleCloseReport} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#004146',
    paddingHorizontal: 8,
  },
  iconButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  reportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  reportText: {
    color: '#20C997',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
}); 