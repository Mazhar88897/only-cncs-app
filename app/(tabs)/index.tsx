import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportIssueButton from '../../components/ReportIssueButton';

interface MachineOption {
  id: string;
  name: string;
}

// Fetch machines from API
const fetchMachineOptions = async () => {
  try {
    console.log('Fetching machines from API...');
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/machines`);
    console.log('Machines API response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch machines: ${response.status}`);
    }
    const data = await response.json();
    console.log('Machines API response data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching machines:', error);
    return [];
  }
}

// Fetch spindles from API
const fetchRouterOptions = async () => {
  try {
    console.log('Fetching routers from API...');
    const response = await fetch(`https://backend.smartcnc.site/api/cnc/get-all/spindles`);
    console.log('Routers API response status:', response.status);
    if (!response.ok) {
      throw new Error(`Failed to fetch spindles: ${response.status}`);
    }
    const data = await response.json();
    console.log('Routers API response data:', data);
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
  
  // Better dropdown state management like Next.js version
  const [isMachineDropdownOpen, setIsMachineDropdownOpen] = useState(false);
  const [isRouterDropdownOpen, setIsRouterDropdownOpen] = useState(false);
  
  const [machineSearch, setMachineSearch] = useState("");
  const [machineOptions, setMachineOptions] = useState<MachineOption[]>([]);
  const [routerOptions, setRouterOptions] = useState<MachineOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [rememberChoice, setRememberChoice] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const router_nav = useRouter();
  const insets = useSafeAreaInsets();
  
  // Add safe fallback for insets to prevent dimension errors
  const safeInsets = {
    top: insets?.top || 0,
    bottom: insets?.bottom || 0,
    left: insets?.left || 0,
    right: insets?.right || 0,
  };

  // Set ready state after component mounts to prevent dimension errors
  useEffect(() => {
    setIsReady(true);
  }, []);

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
        await AsyncStorage.setItem('rememberChoice', 'true');
       
        setCncMachine(data.machine);
        setRouter(data.spindle);
        setRememberChoice(true);
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
        console.log('Loaded machines:', machines);
        console.log('Loaded routers:', routers);
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
        console.log('Initial selections:', { initialMachine, initialRouter });
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

  // Get refreshTrigger from AsyncStorage
  useEffect(() => {
    const getRefreshTrigger = async () => {
      try {
        const trigger = await AsyncStorage.getItem('refreshTrigger');
        setRefreshTrigger(trigger);
      } catch (error) {
        console.error('Error getting refresh trigger:', error);
      }
    };
    getRefreshTrigger();
  }, []);

  // Listen for refreshTrigger changes and reset UI when preferences are reset
  useEffect(() => {
    if (refreshTrigger && machineOptions.length > 0 && routerOptions.length > 0) {
      console.log('Refresh trigger detected, resetting UI to defaults');
      
      // Reset to first available options
      const firstMachine = machineOptions[0].name;
      const firstRouter = routerOptions[0].name;
      
      setCncMachine(firstMachine);
      setRouter(firstRouter);
      
      // Update AsyncStorage
      AsyncStorage.setItem('selectedMachine', firstMachine);
      AsyncStorage.setItem('selectedRouter', firstRouter);
      
      // Clear the refresh trigger
      AsyncStorage.removeItem('refreshTrigger');
      setRefreshTrigger(null);
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
      
      console.log('UI reset to defaults:', { firstMachine, firstRouter });
    }
  }, [refreshTrigger, machineOptions.length, routerOptions.length]);

  // Periodic check for refresh trigger (fallback)
  useEffect(() => {
    const checkRefreshTrigger = async () => {
      try {
        const trigger = await AsyncStorage.getItem('refreshTrigger');
        if (trigger && trigger !== refreshTrigger) {
          console.log('Periodic check found refresh trigger:', trigger);
          setRefreshTrigger(trigger);
        }
      } catch (error) {
        console.error('Error checking refresh trigger:', error);
      }
    };

    const interval = setInterval(checkRefreshTrigger, 1000); // Check every second
    return () => clearInterval(interval);
  }, [refreshTrigger]);

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
  }, [refreshTrigger]);

  // Force update effect
  useEffect(() => {
    if (forceUpdate > 0) {
      console.log('Force update triggered, current state:', { cncMachine, router });
      // This will trigger a re-render and ensure UI is in sync
    }
  }, [forceUpdate, cncMachine, router]);

  // Auto-reset when remember choice is unchecked
  useEffect(() => {
    if (!rememberChoice && machineOptions.length > 0 && routerOptions.length > 0) {
      console.log('Auto-reset triggered - remember choice is unchecked');
      forceResetToDefaults();
    }
  }, [rememberChoice, machineOptions.length, routerOptions.length]);

  const handleRememberChange = async () => {
    const newValue = !rememberChoice;
    setRememberChoice(newValue);
    try {
      await AsyncStorage.setItem('rememberChoice', newValue.toString());
      
      if (newValue) {
        // User checked remember choice - save current selections
        if (cncMachine) {
          await AsyncStorage.setItem('selectedMachine', cncMachine);
        }
        if (router) {
          await AsyncStorage.setItem('selectedRouter', router);
        }
        console.log('Remember choice checked - current selections saved');
      } else {
        // If user unchecks remember choice, clear saved preferences and reset state
        await AsyncStorage.removeItem('selectedMachine');
        await AsyncStorage.removeItem('selectedRouter');
        await AsyncStorage.removeItem('selectedMaterial');
        await AsyncStorage.removeItem('selectedBit');
        
        // Clear state first
        setCncMachine('');
        setRouter('');
        
        // Reset the UI state to first available options after a brief delay
        setTimeout(() => {
          if (machineOptions.length > 0) {
            const firstMachine = machineOptions[0].name;
            setCncMachine(firstMachine);
            AsyncStorage.setItem('selectedMachine', firstMachine);
            console.log('Machine reset to:', firstMachine);
          }
          
          if (routerOptions.length > 0) {
            const firstRouter = routerOptions[0].name;
            setRouter(firstRouter);
            AsyncStorage.setItem('selectedRouter', firstRouter);
            console.log('Router reset to:', firstRouter);
          }
          
          // Force re-render
          setForceUpdate(prev => prev + 1);
        }, 50);
        
        console.log('Remember choice unchecked - preferences cleared and reset to defaults');
      }
    } catch (error) {
      console.error('Error saving remember choice:', error);
    }
  };

  // Force reset function
  const forceResetToDefaults = () => {
    if (machineOptions.length > 0) {
      const firstMachine = machineOptions[0].name;
      setCncMachine(firstMachine);
      AsyncStorage.setItem('selectedMachine', firstMachine);
      console.log('Force reset machine to:', firstMachine);
    }
    if (routerOptions.length > 0) {
      const firstRouter = routerOptions[0].name;
      setRouter(firstRouter);
      AsyncStorage.setItem('selectedRouter', firstRouter);
      console.log('Force reset router to:', firstRouter);
    }
    setForceUpdate(prev => prev + 1);
  };

  const handleNext = async () => {
    // Save preferences if remember choice is enabled
    if (rememberChoice && token) {
      try {
        await fetch('https://backend.smartcnc.site/api/cnc/save-preference', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            machine: cncMachine,
            spindle: router,
            material: await AsyncStorage.getItem('selectedMaterial') || '',
            bit: await AsyncStorage.getItem('selectedBit') || '',
          }),
        });
        console.log('Preferences saved successfully');
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
    
    router_nav.push('/(tabs)/next');
  };

  // Improved dropdown handlers like Next.js version
  const toggleMachineDropdown = () => {
    console.log('Toggle machine dropdown:', !isMachineDropdownOpen);
    console.log('Machine options:', machineOptions);
    setIsRouterDropdownOpen(false);
    setIsMachineDropdownOpen(!isMachineDropdownOpen);
  };

  const toggleRouterDropdown = () => {
    console.log('Toggle router dropdown:', !isRouterDropdownOpen);
    console.log('Router options:', routerOptions);
    setIsMachineDropdownOpen(false);
    setIsRouterDropdownOpen(!isRouterDropdownOpen);
  };

  const selectMachine = async (machineName: string) => {
    setCncMachine(machineName);
    await AsyncStorage.setItem('selectedMachine', machineName);
    setIsMachineDropdownOpen(false);
    setMachineSearch("");
  };

  const selectRouter = async (routerName: string) => {
    setRouter(routerName);
    await AsyncStorage.setItem('selectedRouter', routerName);
    setIsRouterDropdownOpen(false);
  };

  const filteredMachineOptions = machineOptions.filter((option) =>
    option.name.toLowerCase().includes(machineSearch.toLowerCase())
  );

  // Prevent rendering until component is ready to avoid dimension errors
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#44C09E" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[
      styles.container,
      { paddingBottom: Math.max(24, safeInsets.bottom + 24) }
    ]}>
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

      {/* CNC Machine Selection */}
      <View style={styles.inputSection}>
        <Text style={styles.subtitle}>What CNC machine do you have?</Text>
        <TouchableOpacity 
          key={`machine-${forceUpdate}`}
          style={styles.dropdown} 
          onPress={toggleMachineDropdown}
          disabled={isLoading}
        >
          <Text style={styles.dropdownText}>{cncMachine || "Select a machine"}</Text>
          <View style={styles.chevronContainer}>
            <Feather 
              name="chevron-down" 
              size={20} 
              color="white" 
              style={[
                styles.chevron,
                isMachineDropdownOpen && styles.chevronRotated
              ]}
            />
          </View>
        </TouchableOpacity>
        
       
        
        {/* Machine Dropdown List */}
        {isMachineDropdownOpen && (
          <View style={[styles.dropdownList, styles.machineDropdownList]}>
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
            
            <ScrollView 
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {filteredMachineOptions.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.modalOption} 
                  onPress={() => selectMachine(item.name)}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  {cncMachine === item.name && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
              {machineSearch && filteredMachineOptions.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No machines found matching &quot;{machineSearch}&quot;</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
      
      {/* Router Selection */}
      <View style={styles.inputSection}>
        <Text style={styles.subtitle}>What spindle or router are you using?</Text>
        <TouchableOpacity 
          key={`router-${forceUpdate}`}
          style={styles.dropdown} 
          onPress={toggleRouterDropdown}
          disabled={isLoading}
        >
          <Text style={styles.dropdownText}>{router || "Select a router"}</Text>
          <View style={styles.chevronContainer}>
            <Feather 
              name="chevron-down" 
              size={20} 
              color="white" 
              style={[
                styles.chevron,
                isRouterDropdownOpen && styles.chevronRotated
              ]}
            />
          </View>
        </TouchableOpacity>
        
        {/* Debug info */}
       
        
        {/* Router Dropdown List */}
        {isRouterDropdownOpen && (
          <View style={[styles.dropdownList, styles.routerDropdownList]}>
            <ScrollView 
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {routerOptions.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.modalOption} 
                  onPress={() => selectRouter(item.name)}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  {router === item.name && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
      
      {/* Remember Choice Checkbox */}
      <View style={styles.rememberRow}>
        <TouchableOpacity onPress={handleRememberChange} style={styles.checkbox}>
          {rememberChoice && <View style={styles.checkboxInner} />}
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember my choice</Text>
      </View>
      
      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>



      {/* Report Issue Button */}
      <ReportIssueButton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: Math.max(16, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 16
    backgroundColor: '#004146',
    paddingTop: Math.max(20, Dimensions.get('window').height * 0.05), // 5% of screen height, minimum 20
  },

  logo: {
    marginBottom: 32,
  },
  title: {
    fontSize: Math.max(24, Dimensions.get('window').width * 0.07), // 7% of screen width, minimum 24
    color: 'white',
    fontWeight: 'bold',
    marginBottom: Math.max(24, Dimensions.get('window').height * 0.03), // 3% of screen height, minimum 24
    marginTop: Math.max(20, Dimensions.get('window').height * 0.025), // 2.5% of screen height, minimum 20
    alignSelf: 'flex-start',
  },
  inputSection: {
    width: '100%',
    marginBottom: Math.max(20, Dimensions.get('window').height * 0.025), // 2.5% of screen height, minimum 20
    position: 'relative',
  },
  subtitle: {
    fontSize: Math.max(18, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 18
    color: 'white',
    marginBottom: Math.max(12, Dimensions.get('window').height * 0.015), // 1.5% of screen height, minimum 12
    fontWeight: '600',
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
    height: Math.max(44, Dimensions.get('window').height * 0.055), // 5.5% of screen height, minimum 44
    backgroundColor: 'white',
    borderRadius: Math.max(6, Dimensions.get('window').width * 0.015), // 1.5% of screen width, minimum 6
    paddingHorizontal: Math.max(12, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 12
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginVertical: Math.max(20, Dimensions.get('window').height * 0.025), // 2.5% of screen height, minimum 20
  },
  checkbox: {
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 2,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D1',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: '#03BFB5',
    borderRadius: 1,
  },
  rememberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Math.max(20, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 20
    paddingVertical: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
    backgroundColor: '#D1D1D1',
    borderRadius: Math.max(6, Dimensions.get('window').width * 0.015), // 1.5% of screen width, minimum 6
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: Math.max(20, Dimensions.get('window').height * 0.025), // 2.5% of screen height, minimum 20
  },
  nextButtonText: {
    color: '#004146',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    fontWeight: 'bold',
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
    padding: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    backgroundColor: '#03BFB5',
    borderRadius: 4,
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
  chevronContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#03BFB5',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    maxHeight: 300,
    marginTop: 2,
    borderWidth: 2,
    borderColor: '#03BFB5',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScrollView: {
    flex: 1,
  },
  machineDropdownList: {
    position: 'absolute',
    top: '100%', // Position below the dropdown
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  routerDropdownList: {
    position: 'absolute',
    top: '100%', // Position below the dropdown
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  chevron: {
    // React Native doesn't support CSS transitions
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
}); 