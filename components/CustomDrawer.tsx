import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const menuItems: { label: string; route: '/(tabs)' | '/(tabs)/how-to-use' | '/(tabs)/contact-us' | '/(tabs)/more-cnc-resources' }[] = [
  { label: 'Return to the start', route: '/(tabs)' },
  { label: 'How to use', route: '/(tabs)/how-to-use' },
  { label: 'Contact us', route: '/(tabs)/contact-us' },
  { label: 'More CNC resources', route: '/(tabs)/more-cnc-resources' },
];

export default function CustomDrawer(props: any) {
  const router = useRouter();
  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route)}>
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#004146',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  menuItemText: {
    color: '#44C09E',
    fontSize: 18,
  },
}); 