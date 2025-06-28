import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

const materialOptions = ['Hard Plywood', 'Soft Plywood', 'MDF', 'Acrylic'];
const bitOptions = ['1/4 Downcut - 2 Flute', '1/8 Upcut - 1 Flute', 'V-Bit 60 Degree', 'Ball Nose 1/4'];

export default function MaterialScreen() {
  const [material, setMaterial] = useState(materialOptions[0]);
  const [bit, setBit] = useState(bitOptions[0]);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [isBitModalVisible, setIsBitModalVisible] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    router.push('/(tabs)/results');
  };

  const renderOption = (item: string, onSelect: (selected: string) => void) => (
    <TouchableOpacity style={styles.modalOption} onPress={() => onSelect(item)}>
      <Text style={styles.modalOptionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />

      <Text style={styles.subtitle}>What material are you using?</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsMaterialModalVisible(true)}>
        <Text style={styles.dropdownText}>{material}</Text>
        <Feather name="chevron-down" size={24} color="#44C09E" />
      </TouchableOpacity>

      <Text style={styles.subtitle}>What bit are you using?</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setIsBitModalVisible(true)}>
        <Text style={styles.dropdownText}>{bit}</Text>
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
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                renderOption(item, (selected) => {
                  setMaterial(selected);
                  setIsMaterialModalVisible(false);
                })
              }
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
            <FlatList
              data={bitOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) =>
                renderOption(item, (selected) => {
                  setBit(selected);
                  setIsBitModalVisible(false);
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