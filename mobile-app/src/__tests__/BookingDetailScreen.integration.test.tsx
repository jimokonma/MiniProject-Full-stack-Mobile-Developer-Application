import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import { Provider } from 'react-redux';
import { store } from '../app/store';

const mockRoute = {
  params: { id: 'test-booking-id' },
};

const mockBooking = {
  id: 'test-booking-id',
  type: 'dropoff',
  status: 'accepted',
  vehicleMake: 'Tesla',
  vehicleModel: 'Model 3',
  vehiclePlate: 'ABC123',
  location: 'Test Location',
  scheduledFor: '2025-12-31T10:00:00.000Z',
};

// Mock the API hook
jest.mock('../services/api', () => ({
  useBookingByIdQuery: (id: string) => ({
    data: id === 'test-booking-id' ? mockBooking : null,
    refetch: jest.fn(),
  }),
}));

// Mock socket.io with event simulation
const mockSocket = {
  on: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => mockSocket),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('BookingDetailScreen Integration', () => {
  it('updates status when receiving socket event', async () => {
    const { getByText } = renderWithProvider(
      <BookingDetailScreen route={mockRoute} />
    );

    // Initial status should be displayed
    expect(getByText('Status: accepted')).toBeTruthy();

    // Simulate socket event
    const statusUpdateCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'bookingStatusUpdated'
    )?.[1];

    if (statusUpdateCallback) {
      statusUpdateCallback({
        id: 'test-booking-id',
        status: 'on_the_way',
      });
    }

    await waitFor(() => {
      expect(getByText('Status: on the way')).toBeTruthy();
    });
  });

  it('renders status timeline correctly', () => {
    const { getByText } = renderWithProvider(
      <BookingDetailScreen route={mockRoute} />
    );

    expect(getByText('accepted')).toBeTruthy();
    expect(getByText('on_the_way')).toBeTruthy();
    expect(getByText('washing')).toBeTruthy();
    expect(getByText('complete')).toBeTruthy();
    expect(getByText('cancel')).toBeTruthy();
  });
});
