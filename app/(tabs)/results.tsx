import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [multiplier, setMultiplier] = useState<number>(1); // default 1 (no change)
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showSuccessFlag, setShowSuccessFlag] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const fetchMultiplier = async () => {
      const multiplierActual = await AsyncStorage.getItem('multiplier');
      if (multiplierActual) {
        setMultiplier(parseFloat(multiplierActual));
      }
    };
    fetchMultiplier();
  }, []);


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

  const getMultiplied = (value: number | null) =>
    value === null ? null : value * multiplier;

  // Fetch settings from API or AsyncStorage
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError('');

        // First, try to get data from AsyncStorage
        const storedSettings = await AsyncStorage.getItem('setting');
        if (storedSettings) {
          try {
            const data: ApiResponse = JSON.parse(storedSettings);
            console.log('Using stored settings:', data);
            setApiData(data);
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error('Error parsing stored settings:', parseError);
            // Continue to API call if parsing fails
          }
        }

        // If no stored data, get selected values from AsyncStorage and make API call
        const machine = await AsyncStorage.getItem('selectedMachine');
        const spindle = await AsyncStorage.getItem('selectedRouter');
        const bit = await AsyncStorage.getItem('selectedBit');
        const material = await AsyncStorage.getItem('selectedMaterial');
        const remember = await AsyncStorage.getItem('rememberChoice');
     

        // Check if all required values are available
        if (!machine || !spindle || !bit || !material) {
          setError('Please complete the previous steps to get settings');
          setIsLoading(false);
          return;
        }

        const requestBody = {
          machine: machine || '',
          spindle: spindle || '',
          bit: bit || '',
          material: material || '',
          remember: remember === 'true'
        };

        console.log('API Request Body:', requestBody);
        console.log('Request Body Types:', {
          machine: typeof machine,
          spindle: typeof spindle,
          bit: typeof bit,
          material: typeof material,
          remember: typeof remember
        });

        const response = await fetch(`https://backend.smartcnc.site/api/cnc/calculate-settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data: ApiResponse = await response.json();
        setApiData(data);
        console.log('API Response:', data);
        setMultiplier(data.multiplier);
      
        console.log('Multiplier again:', data.multiplier);
        // Check if user has made any adjustments to the multiplier
        

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

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

  const handleGoBack = async () => {
    const multiplierActual = await AsyncStorage.getItem('multiplier');
    if (multiplierActual) {
      setMultiplier(parseFloat(multiplierActual));
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
  };

  const handleSaveMultiplier = async () => {
    try {
      // await AsyncStorage.setItem('multiplier', multiplier.toString());
      setMultiplier(multiplier);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving multiplier:', error);
      Alert.alert('Error', 'Failed to save multiplier');
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      // Get selected values from AsyncStorage
      const selectedMachine = await AsyncStorage.getItem('selectedMachine') || '';
      const selectedRouter = await AsyncStorage.getItem('selectedRouter') || '';
      const selectedBit = await AsyncStorage.getItem('selectedBit') || '';
      const selectedMaterial = await AsyncStorage.getItem('selectedMaterial') || '';
      const rememberChoice = await AsyncStorage.getItem('rememberChoice') || '';

      // Prepare the request body
      const requestBody = {
        machine: selectedMachine,
        spindle: selectedRouter,
        bit: selectedBit,
        material: selectedMaterial,
        rememberChoice: rememberChoice,
        multiplier: multiplier.toString()
      };

      console.log('Share request body:', requestBody);

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
        console.log('Share response text:', responseText);
        
        let errorMessage = 'Failed to share settings';
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.error || data.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing share response:', parseError);
        }
        
        Alert.alert('Error', errorMessage);
        return;
      }

      const responseText = await response.text();
      console.log('Share response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing share response:', parseError);
        Alert.alert('Error', 'Invalid response from server');
        return;
      }

      // Show success message
      setShowSuccessFlag(true);
      Alert.alert(
        'Success', 
        'Settings shared successfully! Thank you for your feedback.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessFlag(false);
              setIsModalVisible(false);
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error sharing settings:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to share settings. Please try again.');
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
              <Text style={styles.warningModalTitle}>Warning</Text>
              <Text style={styles.warningModalMessage}>{message}</Text>
              <TouchableOpacity style={styles.warningModalButton} onPress={onClose}>
                <Text style={styles.warningModalButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />
      <Text style={styles.title}>Suggested Settings</Text>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#44C09E" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
            <Text style={styles.setting}>RPM:      <Text style={styles.value}>{apiData.rpm ? apiData.rpm.toLocaleString() : 'N/A'}</Text></Text>
            <Text style={styles.setting}>Feed:     <Text style={styles.value}>{formatValue(getMultiplied(apiData.feed), 'speed')}</Text></Text>
            <Text style={styles.setting}>DOC:      <Text style={styles.value}>{formatValue(getMultiplied(apiData.depth_of_cut), 'length')}</Text></Text>
            <Text style={styles.setting}>Stepover: <Text style={styles.value}>{formatValue(apiData.stepover, 'length')}</Text></Text>
            <Text style={styles.setting}>Plunge:   <Text style={styles.value}>{formatValue(getMultiplied(apiData.plunge), 'speed')}</Text></Text>
          </View>

          <Text style={styles.sectionHeader}>Profile:</Text>
          <View style={styles.settingsBox}>
            <Text style={styles.setting}>RPM:      <Text style={styles.value}>{apiData.rpm ? apiData.rpm.toLocaleString() : 'N/A'}</Text></Text>
            <Text style={styles.setting}>Feed:     <Text style={styles.value}>
              {getMultiplied(apiData.feed) !== null
                ? formatValue(getMultiplied(apiData.feed)! * 0.9, 'speed')
                : 'N/A'}
            </Text></Text>
            <Text style={styles.setting}>DOC:      <Text style={styles.value}>
              {getMultiplied(apiData.depth_of_cut) !== null
                ? formatValue(getMultiplied(apiData.depth_of_cut)! * 0.9, 'length')
                : 'N/A'}
            </Text></Text>
            <Text style={styles.setting}>Plunge:   <Text style={styles.value}>
              {getMultiplied(apiData.plunge) !== null
                ? formatValue(getMultiplied(apiData.plunge)! * 0.9, 'speed')
                : 'N/A'}
            </Text></Text>
          </View>

          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            If these settings were too slow or too aggressive, you can adjust them:
          </Text>

          <TouchableOpacity style={styles.adjustButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.adjustButtonText}>Adjust Multiplier</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Warning Modal */}
      <WarningModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        message={warningMessage || ''}
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
                <Text style={styles.modalTitle}>Adjust Multiplier</Text>
                <Text style={styles.modalDesc}>
                  By increasing or decreasing this number, you can tune the settings to your machine.{'\n'}
                  One click of the + or - will adjust the core value by 10%.
                </Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(-0.1)}>
                    <Text style={styles.modalBtnText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.modalValueBox}>
                    <Text style={styles.modalValue}>{multiplier}</Text>
                  </View>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(0.1)}>
                    <Text style={styles.modalBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveMultiplier}>
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                </TouchableOpacity>
                <Text style={styles.modalFeedback}>
                  Feedback is vital.{'\n'}If this new value is better, please click the share button
                </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#004146',
    paddingBottom: 48,
  },
  logo: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 8,
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
    fontSize: 18,
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 4,
  },
  settingsBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
  },
  setting: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
  },
  value: {
    fontWeight: 'bold',
    color: '#222',
  },
  goBackButton: {
    backgroundColor: '#44C09E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
    alignItems: 'center',
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  adjustButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
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
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#44C09E',
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#44C09E',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 16,
    width: 40,
    alignItems: 'center',
  },
  modalBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalValueBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    minWidth: 60,
    alignItems: 'center',
  },
  modalValue: {
    color: '#004146',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    backgroundColor: '#44C09E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  modalSaveBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalFeedback: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  modalShareBtn: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  modalShareBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalShareBtnDisabled: {
    opacity: 0.6,
  },
  // Warning Modal styles
  warningModalBox: {
    backgroundColor: '#004146',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ff6b6b',
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  warningModalTitle: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 8,
    textAlign: 'center',
  },
  warningModalMessage: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  warningModalButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  warningModalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 