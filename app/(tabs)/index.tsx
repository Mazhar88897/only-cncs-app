import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

const machineOptions = ['Generic 4040 Machine', 'Shapeoko Pro XL', 'X-Carve Pro', 'Onefinity CNC'];
const spindleOptions = [
  '65mm Makita Router',
  'DeWalt DWP611',
  '80mm Water-Cooled Spindle',
  'Carbide Compact Router',
];

export default function FeedsAndSpeedsScreen() {
  const [rememberChoice, setRememberChoice] = useState(false);
  const [machine, setMachine] = useState(machineOptions[0]);
  const [spindle, setSpindle] = useState(spindleOptions[0]);
  const [isMachineModalVisible, setIsMachineModalVisible] = useState(false);
  const [isSpindleModalVisible, setIsSpindleModalVisible] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    router.push('/(tabs)/material');
  };

  const renderOption = (item: string, onSelect: (selected: string) => void) => (
    <TouchableOpacity style={styles.modalOption} onPress={() => onSelect(item)}>
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />
      <Text style={styles.title}>Lets get started</Text>
      <Text style={styles.subtitle}>What CNC machine do you have?</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsMachineModalVisible(true)}>
        <Text style={styles.dropdownText}>{machine}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>
      <Text style={styles.subtitle}>What spindle or router are you using?</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsSpindleModalVisible(true)}>
        <Text style={styles.dropdownText}>{spindle}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>
      <View style={styles.rememberRow}>
        <TouchableOpacity onPress={() => setRememberChoice(!rememberChoice)} style={styles.checkbox}>
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
            <FlatList
              data={machineOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                renderOption(item, (selected) => {
                  setMachine(selected);
                  setIsMachineModalVisible(false);
                })
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
              data={spindleOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                renderOption(item, (selected) => {
                  setSpindle(selected);
                  setIsSpindleModalVisible(false);
                })
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
  modalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: 'center',
  },
}); 