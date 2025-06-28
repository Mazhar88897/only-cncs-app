import { Feather } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { TouchableOpacity } from 'react-native';
import CustomDrawer from '../../components/CustomDrawer';

export default function TabsLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: '#004146' },
        headerTintColor: 'white',
        headerTitle: '',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{ marginLeft: 16 }}
          >
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Feather name="settings" size={24} color="white" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="material" />
      <Drawer.Screen name="results" />
    </Drawer>
  );
} 