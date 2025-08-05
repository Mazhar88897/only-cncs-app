import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

interface MachineOption {
  id: string;
  name: string;
}

// Fetch machines from API
const fetchMachineOptions = async () => {
  try {
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/machines`);
    if (!response.ok) {
      throw new Error('Failed to fetch machines');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching machines:', error);
    return [];
  }
}

// Fetch spindles from API
const fetchRouterOptions = async () => {
  try {
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/spindles`);
    if (!response.ok) {
      throw new Error('Failed to fetch spindles');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching spindles:', error);
    return [];
  }
}

export default function FeedsAndSpeedsScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [cncMachine, setCncMachine] = useState("");
  const [router, setRouter] = useState("");
  const [isMachineModalVisible, setIsMachineModalVisible] = useState(false);
  const [isSpindleModalVisible, setIsSpindleModalVisible] = useState(false);
  const [machineSearch, setMachineSearch] = useState("");
  const [machineOptions, setMachineOptions] = useState<MachineOption[]>([]);
  const [routerOptions, setRouterOptions] = useState<MachineOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rememberChoice, setRememberChoice] = useState(false);
  const router_nav = useRouter();
 
  

  // Get token from AsyncStorage
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    getToken();
  }, []);

  // Fetch user preference if token is available
  const fetchPreference = async () => {
    try {
      const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-preference`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.machine) {
        await AsyncStorage.setItem('selectedMachine', data.machine);
        await AsyncStorage.setItem('selectedRouter', data.spindle);
        await AsyncStorage.setItem('selectedMaterial', data.material);
        await AsyncStorage.setItem('selectedBit', data.bit);
       
        setCncMachine(data.machine);
        setRouter(data.spindle);

      } else {
        setRememberChoice(false);
      }
      console.log('Preference:', data);
    } catch (error) {
      console.error('Error fetching preference:', error);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const machines = await fetchMachineOptions();
        const routers = await fetchRouterOptions();
        setMachineOptions(machines);
        setRouterOptions(routers);
        
        // On load, check AsyncStorage for previous selection
        let initialMachine = '';
        let initialRouter = '';
        
        const savedMachine = await AsyncStorage.getItem('selectedMachine');
        const savedRouter = await AsyncStorage.getItem('selectedRouter');
        
        if (savedMachine && machines.some((m: MachineOption) => m.name === savedMachine)) {
          initialMachine = savedMachine;
        } else if (machines.length > 0) {
          initialMachine = machines[0].name;
          await AsyncStorage.setItem('selectedMachine', machines[0].name);
        }
        
        if (savedRouter && routers.some((r: MachineOption) => r.name === savedRouter)) {
          initialRouter = savedRouter;
        } else if (routers.length > 0) {
          initialRouter = routers[0].name;
          await AsyncStorage.setItem('selectedRouter', routers[0].name);
        }
        
        setCncMachine(initialMachine);
        setRouter(initialRouter);
      } catch (err) {
        setError('Failed to load machine and spindle data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Only run fetchPreference when token is set
  useEffect(() => {
    if (!token) return;
    fetchPreference();
  }, [token]);

  useEffect(() => {
    const getRememberChoice = async () => {
      try {
        const saved = await AsyncStorage.getItem('rememberChoice');
        if (saved === 'true') {
          setRememberChoice(true);
        } else {
          setRememberChoice(false);
        }
      } catch (error) {
        console.error('Error getting remember choice:', error);
      }
    };
    getRememberChoice();
  }, [saved, refreshTrigger]);

  const handleRememberChange = async () => {
    const newValue = !rememberChoice;
    setRememberChoice(newValue);
    try {
      await AsyncStorage.setItem('rememberChoice', newValue.toString());
    } catch (error) {
      console.error('Error saving remember choice:', error);
    }
  };

  const handleNext = () => {
    router_nav.push('/(tabs)/next');
  };

  const renderMachineOption = ({ item }: { item: MachineOption }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={async () => {
        setCncMachine(item.name);
        await AsyncStorage.setItem('selectedMachine', item.name);
        setIsMachineModalVisible(false);
        setMachineSearch("");
      }}
    >
      <Text style={styles.modalOptionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderRouterOption = ({ item }: { item: MachineOption }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={async () => {
        setRouter(item.name);
        await AsyncStorage.setItem('selectedRouter', item.name);
        setIsSpindleModalVisible(false);
      }}
    >
      <Text style={styles.modalOptionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const filteredMachineOptions = machineOptions.filter((option) =>
    option.name.toLowerCase().includes(machineSearch.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />
      <Text style={styles.title}>Lets get started!</Text>
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44C09E" />
          <Text style={styles.loadingText}>Loading machines and spindles...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.subtitle}>What CNC machine do you have?</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => {
          setIsSpindleModalVisible(false);
          setIsMachineModalVisible(true);
        }}
        disabled={isLoading}
      >
        <Text style={styles.dropdownText}>{cncMachine || "Select a machine"}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>What spindle or router are you using?</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => {
          setIsMachineModalVisible(false);
          setIsSpindleModalVisible(true);
        }}
        disabled={isLoading}
      >
        <Text style={styles.dropdownText}>{router || "Select a router"}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>
      
      <View style={styles.rememberRow}>
        <TouchableOpacity onPress={handleRememberChange} style={styles.checkbox}>
          {rememberChoice && <View style={styles.checkboxInner} />}
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember my choice</Text>
      </View>
      
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Machine Modal */}
      <Modal
        transparent={true}
        visible={isMachineModalVisible}
        onRequestClose={() => setIsMachineModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search machines..."
                value={machineSearch}
                onChangeText={setMachineSearch}
                placeholderTextColor="#888"
              />
            </View>
            
            <FlatList
              data={filteredMachineOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderMachineOption}
              ListEmptyComponent={
                machineSearch ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No machines found matching "{machineSearch}"</Text>
                  </View>
                ) : null
              }
            />
          </View>
        </View>
      </Modal>

      {/* Spindle Modal */}
      <Modal
        transparent={true}
        visible={isSpindleModalVisible}
        onRequestClose={() => setIsSpindleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={routerOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderRouterOption}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#004146',
  },
  logo: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 16,
    alignSelf: 'flex-start',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  dropdown: {
    width: '100%',
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 3,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
    borderRadius: 1,
  },
  rememberText: {
    color: 'white',
    fontSize: 16,
  },
  nextButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#44C09E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    maxHeight: '60%',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
}); 