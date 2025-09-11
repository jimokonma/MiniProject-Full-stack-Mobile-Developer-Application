import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
        <StatusBar style="auto" />
      </AuthProvider>
    </Provider>
  );
}

