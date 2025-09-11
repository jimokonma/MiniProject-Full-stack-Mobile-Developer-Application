import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, useWindowDimensions, Modal, TextInput, ActivityIndicator, TouchableWithoutFeedback, Keyboard, ScrollView, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMyBookingsQuery } from '../services/api';
import { useCreateBookingMutation } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { Formik } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  serviceType: Yup.mixed<'dropoff' | 'mobile_wash'>().oneOf(['dropoff', 'mobile_wash']).required(),
  vehicleMake: Yup.string().required(),
  vehicleModel: Yup.string().required(),
  vehiclePlate: Yup.string().required(),
  location: Yup.string().required(),
  scheduledFor: Yup.string().required(),
});

export default function MyBookingsScreen({ navigation }: any) {
  const { data, refetch } = useMyBookingsQuery();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const { logout } = useAuth();
  const { width, height } = useWindowDimensions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'make' | 'model' | 'location' | null>(null);
  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const closeThreshold = Math.min(200, height * 0.25);

  const resetSheetPosition = () => {
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gesture) => gesture.dy > 4,
      onPanResponderMove: (_evt, gesture) => {
        if (gesture.dy > 0) {
          sheetTranslateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_evt, gesture) => {
        if (gesture.dy > closeThreshold || gesture.vy > 1.2) {
          Animated.timing(sheetTranslateY, {
            toValue: height,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            setIsModalVisible(false);
            sheetTranslateY.setValue(0);
          });
        } else {
          resetSheetPosition();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isModalVisible) {
      sheetTranslateY.setValue(0);
    }
  }, [isModalVisible, sheetTranslateY]);

  const carMakes = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Hyundai'];
  const carModelsByMake: Record<string, string[]> = {
    Toyota: ['Camry', 'Corolla', 'RAV4'],
    Honda: ['Civic', 'Accord', 'CR-V'],
    BMW: ['X5', '3 Series', '5 Series'],
    Mercedes: ['C-Class', 'E-Class', 'GLC'],
    Audi: ['A4', 'Q5', 'A6'],
    Ford: ['Focus', 'Fusion', 'Escape'],
    Hyundai: ['Elantra', 'Sonata', 'Tucson'],
  };
  const defaultModels = ['Sedan', 'SUV', 'Hatchback'];
  const locations = ['Kampala', 'Entebbe', 'Wakiso', 'Jinja', 'Gulu'];
  
  useEffect(() => {
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:2025';
    const socket = io(socketUrl, { autoConnect: true });
    socket.on('bookingStatusUpdated', () => refetch());
    socket.on('notification', (payload: any) => {
      Toast.show({
        type: 'info',
        text1: 'Notification',
        text2: payload.message,
        onPress: () => {
          if (payload.bookingId) {
            navigation.navigate('BookingDetail', { id: payload.bookingId });
          }
        },
      });
    });
    return () => { socket.disconnect(); return; };
  }, [refetch, navigation]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      {/* Header with logout button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#0a84ff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('BookingDetail', { id: item.id })}>
            <View style={styles.card}>
              <Text style={styles.title}>{item.type.replace('_', ' ')}</Text>
              <Text style={styles.status}>Status: {item.status.replace('_', ' ')}</Text>
              <Text style={styles.status}>Vehicle: {item.vehicleMake} {item.vehicleModel}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#6c757d" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubtext}>Create your first booking to get started</Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet Modal with Booking Form */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setOpenDropdown(null); }}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]} {...panResponder.panHandlers}>
            <View style={styles.dragIndicator} />
            <Text style={styles.modalTitle}>Book a Car Wash</Text>
            <Text style={styles.modalSubtitle}>Professional car wash services at your convenience</Text>

            <Formik
              initialValues={{ 
                serviceType: 'dropoff' as 'dropoff' | 'mobile_wash', 
                vehicleMake: '', 
                vehicleModel: '', 
                vehiclePlate: '', 
                location: '', 
                scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
              }}
              validationSchema={schema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const idempotencyKey = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                  const res = await createBooking({ body: values as any, idempotencyKey }).unwrap();
                  Toast.show({ type: 'success', text1: 'Booking Created!', text2: 'Your car wash has been scheduled successfully' });
                  setIsModalVisible(false);
                  navigation.navigate('BookingDetail', { id: res.id });
                } catch (error) {
                  Toast.show({ type: 'error', text1: 'Booking Failed', text2: 'Please try again or contact support' });
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                <ScrollView style={{ maxHeight: height * 0.6 }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetForm}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Service Type</Text>
                    <View style={styles.serviceTypeContainer}>
                      <TouchableOpacity
                        style={[styles.serviceTypeButton, values.serviceType === 'dropoff' && styles.serviceTypeButtonActive]}
                        onPress={() => setFieldValue('serviceType', 'dropoff')}
                      >
                        <Ionicons name="location-outline" size={20} color={values.serviceType === 'dropoff' ? '#fff' : '#0a84ff'} />
                        <Text style={[styles.serviceTypeText, values.serviceType === 'dropoff' && styles.serviceTypeTextActive]}>Drop-off</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.serviceTypeButton, values.serviceType === 'mobile_wash' && styles.serviceTypeButtonActive]}
                        onPress={() => setFieldValue('serviceType', 'mobile_wash')}
                      >
                        <Ionicons name="car-outline" size={20} color={values.serviceType === 'mobile_wash' ? '#fff' : '#0a84ff'} />
                        <Text style={[styles.serviceTypeText, values.serviceType === 'mobile_wash' && styles.serviceTypeTextActive]}>Mobile Wash</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Make dropdown */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Make</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setOpenDropdown(openDropdown === 'make' ? null : 'make')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectText}>{values.vehicleMake || 'Select make'}</Text>
                    </TouchableOpacity>
                    {openDropdown === 'make' && (
                      <View style={styles.dropdown}>
                        {carMakes.map((make) => (
                          <TouchableOpacity
                            key={make}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFieldValue('vehicleMake', make);
                              // reset model when make changes
                              setFieldValue('vehicleModel', '');
                              setOpenDropdown(null);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{make}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {errors.vehicleMake && touched.vehicleMake && (
                      <Text style={styles.errorText}>{errors.vehicleMake}</Text>
                    )}
                  </View>

                  {/* Model dropdown */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Model</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setOpenDropdown(openDropdown === 'model' ? null : 'model')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectText}>{values.vehicleModel || 'Select model'}</Text>
                    </TouchableOpacity>
                    {openDropdown === 'model' && (
                      <View style={styles.dropdown}>
                        {(values.vehicleMake ? carModelsByMake[values.vehicleMake] || defaultModels : defaultModels).map((model) => (
                          <TouchableOpacity
                            key={model}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFieldValue('vehicleModel', model);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{model}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {errors.vehicleModel && touched.vehicleModel && (
                      <Text style={styles.errorText}>{errors.vehicleModel}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>License Plate</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., ABC123"
                      onChangeText={handleChange('vehiclePlate')}
                      value={values.vehiclePlate}
                      autoCapitalize="characters"
                    />
                    {errors.vehiclePlate && touched.vehiclePlate && (
                      <Text style={styles.errorText}>{errors.vehiclePlate}</Text>
                    )}
                  </View>

                  {/* Location dropdown */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Location</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectText}>{values.location || 'Select location'}</Text>
                    </TouchableOpacity>
                    {openDropdown === 'location' && (
                      <View style={styles.dropdown}>
                        {locations.map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFieldValue('location', city);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{city}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {errors.location && touched.location && (
                      <Text style={styles.errorText}>{errors.location}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Scheduled Date & Time</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Select date and time"
                      onChangeText={handleChange('scheduledFor')}
                      value={values.scheduledFor}
                    />
                    {errors.scheduledFor && touched.scheduledFor && (
                      <Text style={styles.errorText}>{errors.scheduledFor}</Text>
                    )}
                  </View>

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
                </ScrollView>
              )}
            </Formik>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  logoutText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#0a84ff',
    fontWeight: '500',
  },
  card: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginHorizontal: 16,
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#0a84ff', // Doovo blue
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#6c757d',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  sheetForm: {
    paddingTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a84ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  // bottom sheet styles
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
    marginBottom: 12,
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
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
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
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalActions: {
    marginTop: 8,
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


