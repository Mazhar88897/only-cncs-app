import { Feather } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomDrawer from '../../components/CustomDrawer';
import SettingsModal from '../../components/SettingsModal';

function CustomHeader({ navigation }: { navigation: any }) {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSettingsPress = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={styles.iconButton}
        >
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
       
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
  return (
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
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#004146',
    height: 64,
    paddingHorizontal: 8,
    paddingTop: 40,
  },
  iconButton: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
}); 