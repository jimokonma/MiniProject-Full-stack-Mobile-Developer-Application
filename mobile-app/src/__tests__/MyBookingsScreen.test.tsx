import React from 'react';
import { render } from '@testing-library/react-native';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import { Provider } from 'react-redux';
import { store } from '../app/store';

const mockNavigation = {
  navigate: jest.fn(),
};

const mockBookings = [
  {
    id: '1',
    type: 'dropoff',
    status: 'accepted',
    vehicleMake: 'Tesla',
    vehicleModel: 'Model 3',
    vehiclePlate: 'ABC123',
  },
  {
    id: '2',
    type: 'mobile_wash',
    status: 'on_the_way',
    vehicleMake: 'BMW',
    vehicleModel: 'X5',
    vehiclePlate: 'XYZ789',
  },
];

// Mock the API hook
jest.mock('../services/api', () => ({
  useMyBookingsQuery: () => ({
    data: mockBookings,
    refetch: jest.fn(),
  }),
}));

// Mock socket.io
jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('MyBookingsScreen', () => {
  it('renders booking list correctly', () => {
    const { getByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );

    expect(getByText('dropoff')).toBeTruthy();
    expect(getByText('mobile wash')).toBeTruthy();
    expect(getByText('Status: accepted')).toBeTruthy();
    expect(getByText('Status: on the way')).toBeTruthy();
    expect(getByText('Vehicle: Tesla Model 3')).toBeTruthy();
    expect(getByText('Vehicle: BMW X5')).toBeTruthy();
  });

  it('renders empty state when no bookings', () => {
    jest.doMock('../services/api', () => ({
      useMyBookingsQuery: () => ({
        data: [],
        refetch: jest.fn(),
      }),
    }));

    const { queryByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );

    expect(queryByText('dropoff')).toBeNull();
  });
});
