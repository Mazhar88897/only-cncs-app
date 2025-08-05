import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

interface MachineOption {
  id: string;
  name: string;
}

// Fetch materials from API
const fetchMaterialOptions = async () => {
  try {
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/materials`);
    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}

// Fetch bits from API
const fetchBitOptions = async () => {
  try {
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/bits`);
    if (!response.ok) {
      throw new Error('Failed to fetch bits');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bits:', error);
    return [];
  }
}

export default function MaterialScreen() {
  const [cncMachine, setCncMachine] = useState("");
  const [router, setRouter] = useState("");
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [isBitModalVisible, setIsBitModalVisible] = useState(false);
  const [bitSearch, setBitSearch] = useState("");
  const [materialOptions, setMaterialOptions] = useState<MachineOption[]>([]);
  const [bitOptions, setBitOptions] = useState<MachineOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router_nav = useRouter();

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const materials = await fetchMaterialOptions();
        const bits = await fetchBitOptions();

        setMaterialOptions(materials);
        setBitOptions(bits);
        
        const sessionBit = await AsyncStorage.getItem('selectedBit');
        const sessionMaterial = await AsyncStorage.getItem('selectedMaterial');
       
        console.log('sessionBit', sessionBit);
        console.log('sessionMaterial', sessionMaterial);
        
        // Set selections (saved values or defaults)
        if (materials.length > 0 && !sessionMaterial) {
          setCncMachine(materials[0].name);
        } else if (materials.length > 0 && sessionMaterial) {
          setCncMachine(sessionMaterial);
        }
        
        if (bits.length > 0 && !sessionBit) {
          setRouter(bits[0].name);
        } else if (bits.length > 0 && sessionBit) {
          setRouter(sessionBit);
        }
      } catch (err) {
        setError('Failed to load material and bit data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (bitOptions.length > 0 && !router) {
      setRouter(bitOptions[0].name);
    }
  }, [bitOptions, router]);

  const handleNext = async () => {
    try {
      // Use current state values directly
      const selectedMachine = await AsyncStorage.getItem('selectedMachine');
      const selectedRouter = await AsyncStorage.getItem('selectedRouter');
      const remember = await AsyncStorage.getItem('rememberChoice');
      const selectedMaterial = cncMachine;
      const selectedBit = router;
      const token = await AsyncStorage.getItem('token');
      
      console.log('=== All Selected Values ===');
      console.log('Machine:', selectedMachine, typeof selectedMachine);
      console.log('Router/Spindle:', selectedRouter, typeof selectedRouter);
      console.log('Material:', selectedMaterial, typeof selectedMaterial);
      console.log('Bit:', selectedBit, typeof selectedBit);
      console.log('Remember:', remember, typeof remember);
      console.log('========================');

      const requestBody = {
        machine: selectedMachine || '',
        spindle: selectedRouter || '',
        bit: selectedBit || '',
        material: selectedMaterial || '',
        remember: remember === 'true'
      };

      console.log('Request body before stringify:', requestBody);
      
      let requestBodyString;
      try {
        requestBodyString = JSON.stringify(requestBody);
        console.log('Request body stringified successfully');
      } catch (stringifyError) {
        console.error('Error stringifying request body:', stringifyError);
        throw new Error('Failed to prepare request data');
      }

      const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-values`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: requestBodyString
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        
        // Check if user has made any adjustments to the multiplier
        const currentMultiplier = await AsyncStorage.getItem('multiplier');
        if (currentMultiplier && parseFloat(currentMultiplier) !== data.multiplier) {
          // User has made adjustments, keep their custom multiplier
          console.log('Keeping user-adjusted multiplier:', currentMultiplier);
        } else {
          // Use the API response multiplier as the base value
          await AsyncStorage.setItem('multiplier', data.multiplier.toString());
          console.log('Using API response multiplier:', data.multiplier);
        }
        
        await AsyncStorage.setItem('setting', JSON.stringify(data));
        await AsyncStorage.setItem('warning', data.warning || '');
        
        console.log('warning', data.warning);
        
        // Navigate to results page
        router_nav.push('/(tabs)/results');
      } else {
        console.error('API request failed:', response.status, response.statusText);
        Alert.alert('Error', `Failed to save settings. Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error making API request:', error);
      Alert.alert('Error', 'An error occurred while processing your request.');
    }
  };

  const renderMaterialOption = ({ item }: { item: MachineOption }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={async () => {
        setCncMachine(item.name);
        await AsyncStorage.setItem('selectedMaterial', item.name);
        setIsMaterialModalVisible(false);
      }}
    >
      <Text style={styles.modalOptionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBitOption = ({ item }: { item: MachineOption }) => (
    <TouchableOpacity 
      style={styles.modalOption} 
      onPress={async () => {
        setRouter(item.name);
        await AsyncStorage.setItem('selectedBit', item.name);
        setIsBitModalVisible(false);
        setBitSearch("");
      }}
    >
      <Text style={styles.modalOptionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const filteredBitOptions = bitOptions.filter((option) =>
    option.name.toLowerCase().includes(bitSearch.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44C09E" />
          <Text style={styles.loadingText}>Loading materials and bits...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Text style={styles.subtitle}>What material are you using?</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => {
          setIsBitModalVisible(false);
          setIsMaterialModalVisible(true);
        }}
        disabled={isLoading}
      >
        <Text style={styles.dropdownText}>{cncMachine || "Select a material"}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>

      <Text style={styles.subtitle}>What bit are you using?</Text>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => {
          setIsMaterialModalVisible(false);
          setIsBitModalVisible(true);
        }}
        disabled={isLoading}
      >
        <Text style={styles.dropdownText}>{router || "Select a bit"}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>

      {/* Material Modal */}
      <Modal
        transparent={true}
        visible={isMaterialModalVisible}
        onRequestClose={() => setIsMaterialModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={materialOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderMaterialOption}
            />
          </View>
        </View>
      </Modal>

      {/* Bit Modal */}
      <Modal
        transparent={true}
        visible={isBitModalVisible}
        onRequestClose={() => setIsBitModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search bits..."
                value={bitSearch}
                onChangeText={setBitSearch}
                placeholderTextColor="#888"
              />
            </View>
            
            <FlatList
              data={filteredBitOptions}
              keyExtractor={(item) => item.id}
              renderItem={renderBitOption}
              ListEmptyComponent={
                bitSearch ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No bits found matching "{bitSearch}"</Text>
                  </View>
                ) : null
              }
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
  subtitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'flex-start',
    width: '100%',
    textAlign: 'center',
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