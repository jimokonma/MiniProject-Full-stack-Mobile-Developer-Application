import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useCreateBookingMutation } from '../services/api';
import Toast from 'react-native-toast-message';

const schema = Yup.object().shape({
  serviceType: Yup.mixed<'dropoff' | 'mobile_wash'>().oneOf(['dropoff', 'mobile_wash']).required(),
  vehicleMake: Yup.string().required(),
  vehicleModel: Yup.string().required(),
  vehiclePlate: Yup.string().required(),
  location: Yup.string().required(),
  scheduledFor: Yup.string().required(),
});

export default function CreateBookingScreen({ navigation, route }: any) {
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const shouldOpenModal = route?.params?.openModal === true;

  React.useEffect(() => {
    if (shouldOpenModal) {
      setIsModalVisible(true);
      // clear the flag so modal doesn't reopen on back
      navigation.setParams?.({ openModal: false });
    }
  }, [shouldOpenModal, navigation]);

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Ionicons name="car-outline" size={32} color="#0a84ff" />
          <Text style={[styles.title, { fontSize: isSmallScreen ? 24 : 28 }]}>Book a Car Wash</Text>
          <Text style={styles.subtitle}>Professional car wash services at your convenience</Text>
        </View>

        <Formik
        initialValues={{ 
          serviceType: 'dropoff' as 'dropoff' | 'mobile_wash', 
          vehicleMake: '', 
          vehicleModel: '', 
          vehiclePlate: '', 
          location: '', 
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16) // Tomorrow
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const res = await createBooking({ body: values as any, idempotencyKey }).unwrap();
            
            Toast.show({
              type: 'success',
              text1: 'Booking Created!',
              text2: 'Your car wash has been scheduled successfully',
            });
            
            navigation.navigate('BookingDetail', { id: res.id });
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Booking Failed',
              text2: 'Please try again or contact support',
            });
          } finally {
            setSubmitting(false);
            setIsModalVisible(false);
          }
        }}
        >
          {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
          <View style={styles.form}>
            {/* Service Type */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Service Type</Text>
              <View style={styles.serviceTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.serviceTypeButton,
                    values.serviceType === 'dropoff' && styles.serviceTypeButtonActive
                  ]}
                  onPress={() => setFieldValue('serviceType', 'dropoff')}
                >
                  <Ionicons 
                    name="location-outline" 
                    size={20} 
                    color={values.serviceType === 'dropoff' ? '#fff' : '#0a84ff'} 
                  />
                  <Text style={[
                    styles.serviceTypeText,
                    values.serviceType === 'dropoff' && styles.serviceTypeTextActive
                  ]}>
                    Drop-off
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.serviceTypeButton,
                    values.serviceType === 'mobile_wash' && styles.serviceTypeButtonActive
                  ]}
                  onPress={() => setFieldValue('serviceType', 'mobile_wash')}
                >
                  <Ionicons 
                    name="car-outline" 
                    size={20} 
                    color={values.serviceType === 'mobile_wash' ? '#fff' : '#0a84ff'} 
                  />
                  <Text style={[
                    styles.serviceTypeText,
                    values.serviceType === 'mobile_wash' && styles.serviceTypeTextActive
                  ]}>
                    Mobile Wash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Make</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallScreen ? 16 : 18 }]}
                  placeholder="e.g., Toyota, Honda, BMW"
                  onChangeText={handleChange('vehicleMake')}
                  value={values.vehicleMake}
                />
                {errors.vehicleMake && touched.vehicleMake && (
                  <Text style={styles.errorText}>{errors.vehicleMake}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallScreen ? 16 : 18 }]}
                  placeholder="e.g., Camry, Civic, X5"
                  onChangeText={handleChange('vehicleModel')}
                  value={values.vehicleModel}
                />
                {errors.vehicleModel && touched.vehicleModel && (
                  <Text style={styles.errorText}>{errors.vehicleModel}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>License Plate</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallScreen ? 16 : 18 }]}
                  placeholder="e.g., ABC123"
                  onChangeText={handleChange('vehiclePlate')}
                  value={values.vehiclePlate}
                  autoCapitalize="characters"
                />
                {errors.vehiclePlate && touched.vehiclePlate && (
                  <Text style={styles.errorText}>{errors.vehiclePlate}</Text>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location & Schedule</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallScreen ? 16 : 18 }]}
                  placeholder="Enter your address or location"
                  onChangeText={handleChange('location')}
                  value={values.location}
                />
                {errors.location && touched.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Scheduled Date & Time</Text>
                <TextInput
                  style={[styles.input, { fontSize: isSmallScreen ? 16 : 18 }]}
                  placeholder="Select date and time"
                  onChangeText={handleChange('scheduledFor')}
                  value={values.scheduledFor}
                />
                {errors.scheduledFor && touched.scheduledFor && (
                  <Text style={styles.errorText}>{errors.scheduledFor}</Text>
                )}
              </View>
            </View>

          </View>

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={28} color="#fff" />
            <Text style={styles.fabText}>Book Car Wash</Text>
          </TouchableOpacity>

          {/* Bottom Sheet Modal */}
          <Modal
            visible={isModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.bottomSheet}>
                <View style={styles.dragIndicator} />
                <Text style={styles.modalTitle}>Confirm Booking</Text>
                <Text style={styles.modalSubtitle}>Submit your car wash request now?</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.confirmButton, isLoading && styles.submitButtonDisabled]}
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsModalVisible(false)}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#0a84ff',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a84ff',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    backgroundColor: '#fff',
    color: '#333',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0a84ff',
    backgroundColor: '#fff',
  },
  serviceTypeButtonActive: {
    backgroundColor: '#0a84ff',
  },
  serviceTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#0a84ff',
  },
  serviceTypeTextActive: {
    color: '#fff',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 16,
    shadowColor: '#0a84ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dee2e6',
    marginVertical: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 4,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    borderRadius: 12,
    paddingVertical: 14,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#212529',
    fontSize: 16,
    fontWeight: '600',
  },
});


