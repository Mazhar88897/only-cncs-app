import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportIssueButton from '../../components/ReportIssueButton';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface ApiResponse {
  multiplier: number;
  spindle: string;
  bit: string;
  material: string;
  rpm: number | null;
  feed: number | null;
  depth_of_cut: number | null;
  stepover: number | null;
  plunge: number | null;
  warning: string | null;
}

export default function ResultsScreen() {
  const [isMetric, setIsMetric] = useState(true); // false = inches, true = millimeters
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false, will be set to true when refreshData is called
  const [error, setError] = useState('');
  const [multiplier, setMultiplier] = useState<number>(1); // default 1 (no change)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [displayMultiplier, setDisplayMultiplier] = useState<number>(1); // Separate state for display
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [timeSinceRefresh, setTimeSinceRefresh] = useState<string>('');
  const [isPreparing, setIsPreparing] = useState(false); // New state for preparation phase
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused(); // Alternative focus detection
  const { toast, showError, showSuccess, hideToast } = useToast();

  // Load initial multiplier from AsyncStorage as fallback
  useEffect(() => {
    // Reset multiplier state to default when component mounts
    // This ensures fresh API data takes precedence
    console.log('Resetting multiplier state to default - waiting for API response');
    setMultiplier(1);
    setDisplayMultiplier(1);
  }, []);

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🚀 SCREEN FOCUSED - AUTO-TRIGGERING REFRESH');
      console.log('📍 Current state - apiData:', !!apiData, 'lastRefreshTime:', lastRefreshTime);
      
      // ALWAYS refresh when screen comes into focus (temporarily remove the 30-second check)
      console.log('✅ ALWAYS REFRESHING - REMOVED 30 SECOND CHECK');
      console.log('⏳ Starting preparation phase (0.5s delay)...');
      setIsPreparing(true);
      
      // Add 0.5 second delay for smoother user experience
      const timer = setTimeout(() => {
        console.log('✅ Preparation complete, starting data refresh...');
        setIsPreparing(false);
        refreshData();
      }, 500);
      
      // Cleanup timer if component unmounts
      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    }, []) // Remove lastRefreshTime dependency to ensure it always runs
  );

  // Don't auto-save multiplier changes - let API response control it


  // Conversion functions
  const mmToInches = (mm: number): number => mm / 25.4;
  const inchesToMm = (inches: number): number => inches * 25.4;
  const mmpmToIpm = (mmpm: number): number => mmpm / 25.4; // mm per minute to inches per minute
  const ipmToMmpm = (ipm: number): number => ipm * 25.4; // inches per minute to mm per minute

  // Format values based on current unit
  // API returns values in millimeters, so we need to convert to inches when isMetric is false
  const formatValue = (value: number | null, unit: 'length' | 'speed'): string => {
    if (value === null) return 'N/A';
    
    if (unit === 'length') {
      if (isMetric) {
        // API returns mm, display as mm
        return `${value.toFixed(2)} mm`;
      } else {
        // API returns mm, convert to inches
        const inches = mmToInches(value);
        return `${inches.toFixed(3)} in`;
      }
    } else if (unit === 'speed') {
      if (isMetric) {
        // API returns mm/min, display as mm/min
        return `${value.toFixed(1)} mm/min`;
      } else {
        // API returns mm/min, convert to inches/min
        const ipm = mmpmToIpm(value);
        return `${ipm.toFixed(1)} ipm`;
      }
    }
    
    return 'N/A';
  };

  const getMultiplied = (value: number | null) => {
    const result = value === null ? null : value * displayMultiplier;
    // Reduced logging to prevent console spam
    // console.log(`getMultiplied: ${value} * ${displayMultiplier} = ${result}`);
    return result;
  };

  // MANUAL REFRESH FUNCTION - Call this anytime to get fresh data
  const refreshData = async () => {
    console.log('🔄 REFRESH TRIGGERED');
    try {
      setIsLoading(true);
      setError('');
      
      // AGGRESSIVE STATE CLEARING - Clear everything immediately
      console.log('🧹 CLEARING ALL STATE BEFORE FRESH FETCH');
      setApiData(null); // Set to null first to trigger re-render
      setMultiplier(1);
      setDisplayMultiplier(1);
      setLastRefreshTime(null);
      setTimeSinceRefresh('');
      setIsPreparing(false); // Reset preparing state
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Clear state with empty structure
      setApiData({
        bit: '',
        depth_of_cut: null,
        feed: null,
        material: '',
        multiplier: 1,
        plunge: null,
        rpm: null,
        spindle: '',
        stepover: null,
        warning: null
      });
      
      // Get stored values for API request
      const token = await AsyncStorage.getItem('token');
      const selectedMachine = await AsyncStorage.getItem('selectedMachine');
      const selectedRouter = await AsyncStorage.getItem('selectedRouter');
      const selectedBit = await AsyncStorage.getItem('selectedBit');
      const selectedMaterial = await AsyncStorage.getItem('selectedMaterial');
      const rememberChoice = await AsyncStorage.getItem('rememberChoice');

      if (!token) {
        setError('Authorization token not found');
        setIsLoading(false);
        return;
      }

      if (!selectedMachine || !selectedRouter || !selectedBit || !selectedMaterial) {
        setError('Missing required selections');
        setIsLoading(false);
        return;
      }

      console.log('Making API call to fetch fresh settings...');
      
      const requestBody = {
        bit: selectedBit,
        machine: selectedMachine,
        material: selectedMaterial,
        remember: rememberChoice === 'true',
        spindle: selectedRouter
      };

      console.log('API Request Body:', requestBody);
      console.log('Request Body Types:', {
        bit: typeof selectedBit,
        machine: typeof selectedMachine,
        material: typeof selectedMaterial,
        remember: typeof rememberChoice,
        spindle: typeof selectedRouter
      });

      const response = await fetch('https://backend.smartcnc.site/api/cnc/get-values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`Failed to fetch settings: ${response.status} ${errorText}`);
      }

      const freshData: ApiResponse = await response.json();
      console.log('API Response:', freshData);

      // Update state with fresh data
      setApiData({
        bit: '',
        depth_of_cut: null,
        feed: null,
        material: '',
        multiplier: 1,
        plunge: null,
        rpm: null,
        spindle: '',
        stepover: null,
        warning: null
      });
      setApiData(freshData);
      setMultiplier(freshData.multiplier);
      setDisplayMultiplier(freshData.multiplier);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('setting', JSON.stringify(freshData));
      await AsyncStorage.setItem('multiplier', freshData.multiplier.toString());
      
      // Update refresh timestamp
      const now = new Date();
      setLastRefreshTime(now);
      setTimeSinceRefresh('');
      
      console.log('✅ Data refreshed successfully!');
      showSuccess('Data refreshed successfully!');
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  // FALLBACK: Also trigger refresh when component mounts (in case useFocusEffect doesn't work)
  useEffect(() => {
    console.log('🔄 COMPONENT MOUNTED - FALLBACK REFRESH');
    console.log('📍 Component mounted at:', new Date().toISOString());
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      console.log('✅ Fallback timer complete, starting refresh...');
      refreshData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only once when component mounts

  // TEST: Add a listener for when the component becomes visible
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Component still alive - checking state...');
      console.log('📍 Current time:', new Date().toISOString());
      console.log('📊 apiData exists:', !!apiData);
      console.log('⏰ lastRefreshTime:', lastRefreshTime);
    }, 5000); // Log every 5 seconds
    
    return () => clearInterval(interval);
  }, [apiData, lastRefreshTime]);

  // ALTERNATIVE: Watch isFocused state from @react-navigation/native
  useEffect(() => {
    console.log('🎯 isFocused changed to:', isFocused);
    
    if (isFocused) {
      console.log('🚀 SCREEN IS NOW FOCUSED (via useIsFocused)');
      console.log('⏳ Starting preparation phase (0.5s delay)...');
      setIsPreparing(true);
      
      const timer = setTimeout(() => {
        console.log('✅ Preparation complete, starting data refresh...');
        setIsPreparing(false);
        refreshData();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      console.log('👋 Screen lost focus');
    }
  }, [isFocused]); // This will run every time isFocused changes

  // Update time since refresh every second - OPTIMIZED to prevent infinite re-renders
  useEffect(() => {
    if (!lastRefreshTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - lastRefreshTime.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      let newTimeString = '';
      if (hours > 0) {
        newTimeString = `${hours}h ${minutes % 60}m ago`;
      } else if (minutes > 0) {
        newTimeString = `${minutes}m ${seconds % 60}s ago`;
      } else {
        newTimeString = `${seconds}s ago`;
      }
      
      // Only update state if the time string has actually changed
      setTimeSinceRefresh(prev => {
        if (prev !== newTimeString) {
          return newTimeString;
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastRefreshTime]);

  useEffect(() => {
    // Check for warning in AsyncStorage
    const checkWarning = async () => {
      try {
        const warning = await AsyncStorage.getItem('warning');
        if (warning && warning !== 'null') {
          setWarningMessage(warning);
          setShowWarningModal(true);
        }
      } catch (error) {
        console.error('Error checking warning:', error);
      }
    };
    checkWarning();
  }, []);

  // Log when displayMultiplier changes - REDUCED LOGGING
  useEffect(() => {
    // Only log significant changes to reduce console spam
    if (displayMultiplier !== 1) {
      console.log('displayMultiplier changed to:', displayMultiplier);
    }
  }, [displayMultiplier]);

  // Log when apiData changes - REDUCED LOGGING
  useEffect(() => {
    // Only log when apiData actually changes to reduce console spam
    if (apiData) {
      console.log('apiData updated with new values');
    }
  }, [apiData]);

  



  const handleGoBack = async () => {
    const multiplierActual = await AsyncStorage.getItem('multiplier');
    if (multiplierActual) {
      const value = parseFloat(multiplierActual);
      setMultiplier(value);
      setDisplayMultiplier(value);
    }
  
    router.back();
  };

  const handleAdjust = (delta: number) => {
    setMultiplier((prev) => {
      let next = Math.round((prev + delta) * 10) / 10;
      if (next < 0.1) next = 0.1;
      if (next > 2.0) next = 2.0;
      return next;
    });
    
    // Also update the display multiplier for immediate UI updates
    setDisplayMultiplier((prev) => {
      let next = Math.round((prev + delta) * 10) / 10;
      if (next < 0.1) next = 0.1;
      if (next > 2.0) next = 2.0;
      return next;
    });
  };

  const handleSaveMultiplier = async (newMultiplier: number) => {
    try {
      // Update both the multiplier state and display multiplier
      setMultiplier(newMultiplier);
      setDisplayMultiplier(newMultiplier);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('multiplier', newMultiplier.toString());
      
      setIsModalVisible(false);
      showSuccess('Multiplier saved successfully!');
    } catch (error) {
      console.error('Error saving multiplier:', error);
      showError('Failed to save multiplier');
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        showError('Authentication token not found');
        return;
      }

      // Get selected values from AsyncStorage
      const selectedMachine = await AsyncStorage.getItem('selectedMachine') || '';
      const selectedRouter = await AsyncStorage.getItem('selectedRouter') || '';
      const selectedBit = await AsyncStorage.getItem('selectedBit') || '';
      const selectedMaterial = await AsyncStorage.getItem('selectedMaterial') || '';
      const rememberChoice = await AsyncStorage.getItem('rememberChoice') || '';

      // Also try to get from stored settings if AsyncStorage keys are empty
      let finalBit = selectedBit;
      let finalMaterial = selectedMaterial;
      
      if (!selectedBit || !selectedMaterial) {
        const storedSettings = await AsyncStorage.getItem('setting');
        if (storedSettings) {
          try {
            const settings = JSON.parse(storedSettings);
            if (!selectedBit && settings.bit) {
              finalBit = settings.bit;
            }
            if (!selectedMaterial && settings.material) {
              finalMaterial = settings.material;
            }
          } catch (parseError) {
            console.error('Error parsing stored settings:', parseError);
          }
        }
      }

      // Log all values before sending
      console.log('Share values:', {
        machine: selectedMachine,
        spindle: selectedRouter,
        bit: finalBit,
        material: finalMaterial,
        multiplier
      });

      // Pre-check for missing fields
      if (!selectedMachine || !selectedRouter || !finalBit || !finalMaterial || !multiplier) {
        showError('All fields are required to share settings.');
        setIsSharing(false);
        return;
      }

      // Prepare the request body
      const requestBody = {
        machine: selectedMachine,
        spindle: selectedRouter,
        bit: finalBit,
        material: finalMaterial,
        multiplier: multiplier.toString()
      };

      console.log('Share request body:', requestBody);
      console.log('Token available:', !!token);

      // Make the API call
      const response = await fetch('https://backend.smartcnc.site/api/cnc/share-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Share response status:', response.status);
      console.log('Share response headers:', response.headers);

      if (!response.ok) {
        const responseText = await response.text();
        console.log('Share response status:', response.status);
        console.log('Share response text:', responseText);
        
        let errorMessage = 'Failed to share settings';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        showError(`HTTP ${response.status}: ${errorMessage}`);
        setIsSharing(false);
        return;
      }

      const responseData = await response.text();
      console.log('Share response data:', responseData);

      try {
        const parsedData = JSON.parse(responseData);
        if (parsedData.success) {
          showSuccess('Settings shared successfully!');
        } else {
          showError('Failed to share settings');
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        showError('Invalid response from server');
      }
    } catch (error) {
      console.error('Share error:', error);
      if (error instanceof Error && error.message.includes('Network request failed')) {
        showError('Network Error: Please check your internet connection and try again.');
      } else {
        showError('Failed to share settings. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const WarningModal = ({ visible, onClose, message }: { visible: boolean; onClose: () => void; message: string }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.warningModalBox}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.warningModalTitle}>Warning</Text>
              <Text style={styles.warningModalMessage}>Be cautious with this setting</Text>
              <TouchableOpacity style={styles.warningModalButton} onPress={() => {
                onClose();
                handleSaveMultiplier(multiplier);
              }}>
                <Text style={styles.warningModalButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );



  // Debug: Log when component re-renders
  console.log('🔄 ResultsScreen re-render - multiplier:', multiplier, 'displayMultiplier:', displayMultiplier);
  console.log('📊 Current apiData:', apiData);
  console.log('⏰ Last refresh time:', lastRefreshTime);
  console.log('⏱️ Time since refresh:', timeSinceRefresh);
  console.log('🎯 isPreparing:', isPreparing, 'isLoading:', isLoading);

  return (
    <ScrollView contentContainerStyle={[
      styles.container,
      { paddingBottom: Math.max(48, insets.bottom + 48) }
    ]}>
      
      {/* DEBUG INDICATOR - Remove this after fixing */}
      
      
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={styles.title}>Suggested Settings</Text>
        
      </View>

            {/* REFRESH BUTTON */}
      <TouchableOpacity 
        onPress={refreshData} 
        disabled={isLoading}
        style={{
          alignSelf: 'flex-start',
          
          paddingHorizontal: 20,
          
          
          marginBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Feather name="refresh-cw" size={16} color="white" />
        )}
        <Text style={{ color: 'white', fontWeight: '600' }}>
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Text>
              </TouchableOpacity>

      

      {isPreparing && !apiData && (
        <View style={styles.preparingContainer}>
          <ActivityIndicator size="small" color="#44C09E" />
          <Text style={styles.preparingText}>Preparing...</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44C09E" />
          <Text style={styles.loadingText}>
            {apiData ? 'Refreshing settings...' : 'Loading settings...'}
          </Text>
        </View>
      )}

      

      {apiData && (
        <>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, !isMetric && styles.toggleActive]}>Inches</Text>
            <Switch
              value={isMetric}
              onValueChange={setIsMetric}
              trackColor={{ false: '#888', true: '#44C09E' }}
              thumbColor={isMetric ? '#44C09E' : '#fff'}
            />
            <Text style={[styles.toggleLabel, isMetric && styles.toggleActive]}>Millimeters</Text>
          </View>

          <Text style={styles.sectionHeader}>Area Clearance (Pocket):</Text>
          <View style={styles.settingsBox}>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>RPM:</Text>
              <Text style={styles.value}>{apiData.rpm ? apiData.rpm.toLocaleString() : 'N/A'}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Feed:</Text>
              <Text style={styles.value}>{formatValue(getMultiplied(apiData.feed), 'speed')}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>DOC:</Text>
              <Text style={styles.value}>{formatValue(getMultiplied(apiData.depth_of_cut), 'length')}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Stepover:</Text>
              <Text style={styles.value}>{formatValue(apiData.stepover, 'length')}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Plunge:</Text>
              <Text style={styles.value}>{formatValue(getMultiplied(apiData.plunge), 'speed')}</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Profile:</Text>
          <View style={styles.settingsBox}>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>RPM:</Text>
              <Text style={styles.value}>{apiData.rpm ? apiData.rpm.toLocaleString() : 'N/A'}</Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Feed:</Text>
              <Text style={styles.value}>
                {getMultiplied(apiData.feed) !== null
                  ? formatValue(getMultiplied(apiData.feed)! * 0.9, 'speed')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>DOC:</Text>
              <Text style={styles.value}>
                {getMultiplied(apiData.depth_of_cut) !== null
                  ? formatValue(getMultiplied(apiData.depth_of_cut)! * 0.9, 'length')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.setting}>
              <Text style={styles.settingLabel}>Plunge:</Text>
              <Text style={styles.value}>
                {getMultiplied(apiData.plunge) !== null
                  ? formatValue(getMultiplied(apiData.plunge)! * 0.9, 'speed')
                  : 'N/A'}
              </Text>
            </View>
          </View>

          

          <Text style={styles.infoText}>
            If these settings were too slow or too aggressive, you can adjust them:
          </Text>

          <TouchableOpacity style={styles.adjustButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.adjustButtonText}>Adjust Multiplier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Warning Modal */}
      <WarningModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        message=""
      />

      {/* Adjust Multiplier Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Area Clearance (Pocket):</Text>
                <Text style={styles.modalDesc}>
                  By increasing or decreasing this number, you can tune the settings to your machine.{'\n'}
                  One click of the + or - will adjust the core value by 10%
                </Text>
                
                <View style={styles.modalControls}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(-0.1)}>
                    <Text style={styles.modalBtnText}>-</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.modalValueBox}>
                    <Text style={styles.modalValue}>{displayMultiplier.toFixed(2)}</Text>
                  </View>
                  
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(0.1)}>
                    <Text style={styles.modalBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setShowWarningModal(true)}>
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalFeedback}>Feedback is vital. If this new value is better, please click the share button</Text>
                
                <TouchableOpacity 
                  style={[styles.modalShareBtn, isSharing && styles.modalShareBtnDisabled]} 
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  <Text style={styles.modalShareBtnText}>
                    {isSharing ? 'Sharing...' : 'Share'}
                  </Text>
                </TouchableOpacity>
                

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <ReportIssueButton />
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onHide={hideToast}
      />
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
    marginBottom: 16,
  },
  title: {
    fontSize: Math.max(20, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 20
    color: 'white',
    fontWeight: 'bold',
    marginBottom: Math.max(12, Dimensions.get('window').height * 0.015), // 1.5% of screen height, minimum 12
    textAlign: 'left',
    paddingTop: 10,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: 'white',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    marginTop: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
  },
  errorContainer: {
    backgroundColor: '#ff6b6b',
    padding: Math.max(12, Dimensions.get('window').width * 0.03), // 3% of screen width, minimum 12
    borderRadius: Math.max(6, Dimensions.get('window').width * 0.015), // 1.5% of screen width, minimum 6
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
    width: '100%',
  },
  errorText: {
    color: 'white',
    fontSize: Math.max(12, Dimensions.get('window').width * 0.035), // 3.5% of screen width, minimum 12
    textAlign: 'center',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
    alignSelf: 'flex-start',
  },
  toggleLabel: {
    color: '#fff',
    fontSize: Math.max(18, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    marginHorizontal: Math.max(8, Dimensions.get('window').width * 0.02), // 2% of screen width, minimum 8
    opacity: 0.5,
  },
  toggleActive: {
    color: '#44C09E',
    opacity: 1,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#44C09E',
    fontWeight: 'bold',
    fontSize: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    alignSelf: 'flex-start',
    marginTop: Math.max(12, Dimensions.get('window').height * 0.015), // 1.5% of screen height, minimum 12
    marginBottom: Math.max(4, Dimensions.get('window').height * 0.005), // 0.5% of screen height, minimum 4
  },
  settingsBox: {
    backgroundColor: 'white',
    borderRadius: 2,
    padding: Math.max(20, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 20
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
    width: '100%',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#004851',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
  },
  settingLabel: {
    color: '#222',
    fontSize: Math.max(20, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 18
    fontWeight: '500',
  },
  value: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: Math.max(18, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 18
    textAlign: 'left',

  },
  goBackButton: {
    backgroundColor: 'white',
    borderRadius: 2,
    paddingVertical: Math.max(12, Dimensions.get('window').height * 0.015), // 1.5% of screen height, minimum 12
    paddingHorizontal: Math.max(32, Dimensions.get('window').width * 0.08), // 8% of screen width, minimum 32
    marginTop: Math.max(12, Dimensions.get('window').height * 0.015), // 1.5% of screen height, minimum 12
    marginBottom: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  goBackButtonText: {
    color: 'black',
    fontSize: Math.max(18, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 18
    fontWeight: 'bold',
  },
  infoText: {
    color: '#4cd3c2',
    fontSize: Math.max(18, Dimensions.get('window').width * 0.035), // 3.5% of screen width, minimum 12
    textAlign: 'left',
    marginVertical: Math.max(12, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
  },
  adjustButton: {
    backgroundColor: '#2196F3',
    borderRadius: 2,
    paddingVertical: Math.max(10, Dimensions.get('window').height * 0.0125), // 1.25% of screen height, minimum 10
    paddingHorizontal: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  adjustButtonText: {
    color: 'white',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#004146',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#03BFB5',
    padding: Math.max(20, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 20
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#44C09E',
    fontWeight: 'bold',
    fontSize: Math.max(20, Dimensions.get('window').width * 0.055), // 5.5% of screen width, minimum 20
    marginBottom: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
    textAlign: 'center',
  },
  modalDesc: {
    color: 'white',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    textAlign: 'left',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
  },
  modalBtn: {
    backgroundColor: '#03BFB5',
    borderRadius: 0,
    padding: Math.max(10, Dimensions.get('window').width * 0.025), // 2.5% of screen width, minimum 10
    marginHorizontal: 0,
    width: Math.max(40, Dimensions.get('window').width * 0.1), // 10% of screen width, minimum 40
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#333333',
    fontSize: Math.max(20, Dimensions.get('window').width * 0.055), // 5.5% of screen width, minimum 20
    fontWeight: 'bold',
  },
  modalValueBox: {
    backgroundColor: 'white',
    borderRadius: 2,
    paddingVertical: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
    paddingHorizontal: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    minWidth: Math.max(60, Dimensions.get('window').width * 0.15), // 15% of screen width, minimum 60
    alignItems: 'center',
  },
  modalValue: {
    color: '#004146',
    fontSize: Math.max(20, Dimensions.get('window').width * 0.055), // 5.5% of screen width, minimum 20
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    backgroundColor: '#03BFB5',
    borderRadius: 2,
    paddingVertical: Math.max(10, Dimensions.get('window').height * 0.0125), // 1.25% of screen height, minimum 10
    paddingHorizontal: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
  },
  modalSaveBtnText: {
    color: 'white',
    fontSize: Math.max(16, Dimensions.get('window').width * 0.045), // 4.5% of screen width, minimum 16
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalFeedback: {
    color: 'white',
    fontSize: Math.max(12, Dimensions.get('window').width * 0.035), // 3.5% of screen width, minimum 12
    textAlign: 'center',
    marginVertical: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
  },
  modalShareBtn: {
    backgroundColor: '#03BFB5',
    borderRadius: 2,
    paddingVertical: Math.max(10, Dimensions.get('window').height * 0.0125), // 1.25% of screen height, minimum 10
    paddingHorizontal: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    alignItems: 'center',
    width: '100%',
  },
  modalShareBtnText: {
    color: 'black',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    fontWeight: 'bold',
  },
  modalShareBtnDisabled: {
    opacity: 0.6,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#03BFB5',
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Warning Modal styles
  warningModalBox: {
    backgroundColor: '#004146',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#03BFB5',
    padding: Math.max(20, Dimensions.get('window').width * 0.05), // 5% of screen width, minimum 20
    width: '90%',
    alignItems: 'center',
  },
  warningModalTitle: {
    color: '#03BFB5',
    fontWeight: 'bold',
    fontSize: Math.max(20, Dimensions.get('window').width * 0.055), // 5.5% of screen width, minimum 20
    marginBottom: Math.max(8, Dimensions.get('window').height * 0.01), // 1% of screen height, minimum 8
    textAlign: 'center',
  },
  warningModalMessage: {
    color: 'white',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04), // 4% of screen width, minimum 14
    textAlign: 'center',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
  },
  warningModalButton: {
    backgroundColor: '#03BFB5',
    borderRadius: 2,
    paddingVertical: Math.max(10, Dimensions.get('window').height * 0.0125), // 1.25% of screen height, minimum 10
    paddingHorizontal: Math.max(24, Dimensions.get('window').width * 0.06), // 6% of screen width, minimum 24
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  warningModalButtonText: {
    color: '#004146',
    fontSize: Math.max(16, Dimensions.get('window').width * 0.045), // 4.5% of screen width, minimum 16
    fontWeight: 'bold',
  },
  modalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02), // 2% of screen height, minimum 16
  },
  statusContainer: {
    backgroundColor: 'rgba(68, 192, 158, 0.1)',
    paddingHorizontal: Math.max(12, Dimensions.get('window').width * 0.03),
    paddingVertical: Math.max(8, Dimensions.get('window').height * 0.01),
    borderRadius: Math.max(6, Dimensions.get('window').width * 0.015),
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02),
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#44C09E',
  },
  statusText: {
    color: '#44C09E',
    fontSize: Math.max(12, Dimensions.get('window').width * 0.035),
    fontWeight: '500',
  },
  preparingContainer: {
    alignItems: 'center',
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02),
    padding: Math.max(16, Dimensions.get('window').width * 0.04),
    backgroundColor: 'rgba(68, 192, 158, 0.1)',
    borderRadius: Math.max(8, Dimensions.get('window').width * 0.02),
    borderWidth: 1,
    borderColor: '#44C09E',
  },
  preparingText: {
    color: '#44C09E',
    fontSize: Math.max(14, Dimensions.get('window').width * 0.04),
    marginTop: Math.max(8, Dimensions.get('window').height * 0.01),
    fontWeight: '500',
  },
  debugContainer: {
    backgroundColor: '#ff6b6b',
    padding: Math.max(12, Dimensions.get('window').width * 0.03),
    borderRadius: Math.max(6, Dimensions.get('window').width * 0.015),
    marginBottom: Math.max(16, Dimensions.get('window').height * 0.02),
    width: '100%',
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  debugText: {
    color: 'white',
    fontSize: Math.max(10, Dimensions.get('window').width * 0.025),
    textAlign: 'left',
    fontWeight: '500',
    marginBottom: Math.max(4, Dimensions.get('window').height * 0.005),
  },
  debugButton: {
    backgroundColor: '#ff4757',
    padding: Math.max(8, Dimensions.get('window').width * 0.02),
    borderRadius: Math.max(4, Dimensions.get('window').width * 0.01),
    marginTop: Math.max(8, Dimensions.get('window').height * 0.01),
    alignSelf: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: Math.max(12, Dimensions.get('window').width * 0.03),
    fontWeight: 'bold',
  },
}); 