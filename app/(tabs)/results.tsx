import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Logo from '../../assets/images/logo.svg';

export default function ResultsScreen() {
  const [isMetric, setIsMetric] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [multiplier, setMultiplier] = useState(0.9);
  const router = useRouter();

  const handleGoBack = () => {
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Logo width={180} height={70} style={styles.logo} />
      <Text style={styles.title}>Suggested settings:</Text>
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
        <Text style={styles.setting}>RPM:      <Text style={styles.value}>15,000</Text></Text>
        <Text style={styles.setting}>Feed:     <Text style={styles.value}>70 ipm</Text></Text>
        <Text style={styles.setting}>DOC:      <Text style={styles.value}>0.11 in</Text></Text>
        <Text style={styles.setting}>Stepover: <Text style={styles.value}>0.09 in</Text></Text>
        <Text style={styles.setting}>Plunge:   <Text style={styles.value}>78 ipm</Text></Text>
      </View>
      <Text style={styles.sectionHeader}>Profile:</Text>
      <View style={styles.settingsBox}>
        <Text style={styles.setting}>RPM:      <Text style={styles.value}>15,000</Text></Text>
        <Text style={styles.setting}>Feed:     <Text style={styles.value}>70 ipm</Text></Text>
        <Text style={styles.setting}>DOC:      <Text style={styles.value}>0.08 in</Text></Text>
        <Text style={styles.setting}>Plunge:   <Text style={styles.value}>70 ipm</Text></Text>
      </View>
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>
        If these settings were too slow or too aggressive, you can adjust them:
      </Text>
      <TouchableOpacity style={styles.adjustButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.adjustButtonText}>Adjust multiplier</Text>
      </TouchableOpacity>

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
                  By increasing or decreasing this number, you can tune the settings to your machine. {'\n'}
                  One click of the + or - will adjust the core value by 10%.
                </Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(-0.1)}>
                    <Text style={styles.modalBtnText}>-</Text>
                  </TouchableOpacity>
                  <View style={styles.modalValueBox}>
                    <Text style={styles.modalValue}>{multiplier.toFixed(1)}</Text>
                  </View>
                  <TouchableOpacity style={styles.modalBtn} onPress={() => handleAdjust(0.1)}>
                    <Text style={styles.modalBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.modalSaveBtnText}>Save</Text>
                </TouchableOpacity>
                <Text style={styles.modalFeedback}>Feedback is vital. {'\n'}If this new value is better, please click the share button</Text>
                <TouchableOpacity style={styles.modalShareBtn}>
                  <Text style={styles.modalShareBtnText}>Share</Text>
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
    paddingBottom: 13
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
}); 