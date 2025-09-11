import React from 'react';
import { render } from '@testing-library/react-native';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import * as RN from 'react-native';

const mockNavigation = {
  navigate: jest.fn(),
};

// Spy on useWindowDimensions instead of mocking entire react-native
const useWindowDimensionsSpy = jest.spyOn(RN, 'useWindowDimensions');

// Mock the API hook
jest.mock('../services/api', () => ({
  useMyBookingsQuery: () => ({
    data: [
      {
        id: '1',
        type: 'dropoff',
        status: 'accepted',
        vehicleMake: 'Tesla',
        vehicleModel: 'Model 3',
        vehiclePlate: 'ABC123',
      },
    ],
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

describe('Responsive Layout', () => {
  it('renders correctly on iPhone SE dimensions', () => {
    useWindowDimensionsSpy.mockReturnValue({ width: 375, height: 667, scale: 2, fontScale: 2 } as any);
    const { getByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );
    expect(getByText('dropoff')).toBeTruthy();
  });

  it('renders correctly on Samsung S24+ dimensions', () => {
    useWindowDimensionsSpy.mockReturnValue({ width: 412, height: 915, scale: 3, fontScale: 3 } as any);
    const { getByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );
    expect(getByText('dropoff')).toBeTruthy();
  });

  it('renders correctly on iPhone 13 Pro Max dimensions', () => {
    useWindowDimensionsSpy.mockReturnValue({ width: 428, height: 926, scale: 3, fontScale: 3 } as any);
    const { getByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );
    expect(getByText('dropoff')).toBeTruthy();
  });

  it('renders correctly on Pixel 5 dimensions', () => {
    useWindowDimensionsSpy.mockReturnValue({ width: 393, height: 851, scale: 3, fontScale: 3 } as any);
    const { getByText } = renderWithProvider(
      <MyBookingsScreen navigation={mockNavigation} />
    );
    expect(getByText('dropoff')).toBeTruthy();
  });
});
