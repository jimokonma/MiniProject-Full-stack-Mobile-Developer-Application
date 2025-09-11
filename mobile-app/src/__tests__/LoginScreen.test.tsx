import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import { Provider } from 'react-redux';
import { store } from '../app/store';

const mockNavigation = {
  replace: jest.fn(),
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LoginScreen', () => {
  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('validates email format', async () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Formik validation should prevent submission with invalid email
    await waitFor(() => {
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });

  it('validates password length', async () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123'); // Too short
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockNavigation.replace).not.toHaveBeenCalled();
    });
  });
});
