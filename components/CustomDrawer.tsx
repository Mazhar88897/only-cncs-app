import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../assets/images/logo.svg';

const menuItems: { label: string; route: '/(tabs)' | '/(tabs)/how-to-use' | '/(tabs)/contact-us' | '/(tabs)/more-cnc-resources' }[] = [
  { label: 'To the Start', route: '/(tabs)' },
  { label: 'How to use', route: '/(tabs)/how-to-use' },
  { label: 'Contact us', route: '/(tabs)/contact-us' },
  { label: 'More CNC resources', route: '/(tabs)/more-cnc-resources' },
];

export default function CustomDrawer(props: any) {
  const router = useRouter();
  
  // Get current route to highlight active item
  const currentRoute = props.state?.routes[props.state.index]?.name || 'index';
  
  const getRouteForHighlight = (route: string) => {
    if (route === '/(tabs)' && currentRoute === 'index') return true;
    if (route.includes(currentRoute)) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo and Close Button */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Logo width={180} height={70} />
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuItemsContainer}>
        {menuItems.map((item) => {
          const isActive = getRouteForHighlight(item.route);
          return (
            <TouchableOpacity 
              key={item.label} 
              style={[styles.menuItem, isActive && styles.activeMenuItem]} 
              onPress={() => router.push(item.route)}
            >
              <Text style={[styles.menuItemText, isActive && styles.activeMenuItemText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004146',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemsContainer: {
    flex: 1,
    paddingTop: 10,
    margin: 20,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
  },
  activeMenuItem: {
    backgroundColor: 'white',
  },
  menuItemText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeMenuItemText: {
    color: '#004146',
  },
}); 