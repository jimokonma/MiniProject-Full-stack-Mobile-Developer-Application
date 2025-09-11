import 'react-native-gesture-handler/jestSetup';

// Silence React Native warnings in tests
jest.spyOn(globalThis.console, 'warn').mockImplementation(() => {});
jest.spyOn(globalThis.console, 'error').mockImplementation(() => {});

// Mock all React Native feature flags - comprehensive coverage
jest.mock('react-native/src/private/featureflags/ReactNativeFeatureFlags', () => ({
  enableNativeCSSParsing: () => false,
  disableInteractionManager: () => false,
  shouldUseAnimatedObjectForTransform: () => false,
  shouldUseSetNativePropsInFabric: () => false,
  shouldUseSetNativePropsInNativeAnimationsInFabric: () => false,
  enableFabricLogs: () => false,
  enableLayoutAnimationsOnAndroid: () => false,
  enableLayoutAnimationsOnIOS: () => false,
  isLayoutAnimationEnabled: () => false,
  enableViewRecycling: () => false,
  enableBackgroundExecutor: () => false,
  enableTurboModule: () => false,
  enableFabricRenderer: () => false,
  enableConcurrentRoot: () => false,
  enableCustomDrawOrderFabric: () => false,
  enableFixForClippedSubviewsCrash: () => false,
  enableGranularShadowTreeStateReconciliation: () => false,
  enableLongTaskAPI: () => false,
  enableMicrotasks: () => false,
  enableSynchronousStateUpdates: () => false,
  enableUIConsistency: () => false,
  inspectorEnableCxxInspectorPackagerConnection: () => false,
  inspectorEnableModernCDPRegistry: () => false,
}));

jest.mock('react-native/src/private/featureflags/ReactNativeFeatureFlagsBase', () => ({
  enableNativeCSSParsing: () => false,
  disableInteractionManager: () => false,
  shouldUseAnimatedObjectForTransform: () => false,
  shouldUseSetNativePropsInFabric: () => false,
  shouldUseSetNativePropsInNativeAnimationsInFabric: () => false,
  enableFabricLogs: () => false,
  enableLayoutAnimationsOnAndroid: () => false,
  enableLayoutAnimationsOnIOS: () => false,
  isLayoutAnimationEnabled: () => false,
  enableViewRecycling: () => false,
  enableBackgroundExecutor: () => false,
  enableTurboModule: () => false,
  enableFabricRenderer: () => false,
  enableConcurrentRoot: () => false,
}));

// Mock Platform Constants - must be before any RN imports
jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsIOS', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      reactNativeVersion: { major: 0, minor: 79, patch: 5 },
      systemName: 'iOS',
      systemVersion: '15.0',
      model: 'iPhone',
      brand: 'Apple',
      isDisableAnimations: false,
    }),
  },
}));

jest.mock('react-native/Libraries/Utilities/NativePlatformConstantsAndroid', () => ({
  __esModule: true,
  default: {
    getConstants: () => ({
      reactNativeVersion: { major: 0, minor: 79, patch: 5 },
      Version: 28,
      Release: '9',
      Model: 'Android SDK',
      Brand: 'google',
      isDisableAnimations: false,
    }),
  },
}));

// Mock Platform module directly
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  __esModule: true,
  default: {
    OS: 'ios',
    Version: '15.0',
    constants: {
      reactNativeVersion: { major: 0, minor: 79, patch: 5 },
      systemName: 'iOS',
      systemVersion: '15.0',
      model: 'iPhone',
      brand: 'Apple',
      isDisableAnimations: false,
    },
    isDisableAnimations: false,
    select: (obj: any) => {
      if (typeof obj === 'object' && obj !== null) {
        return (obj as any).ios !== undefined ? (obj as any).ios : (obj as any).default;
      }
      return obj;
    },
    isTesting: true,
    isPad: false,
    isTV: false,
  },
}));

// Mock StyleSheet early
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: (styles: any) => styles,
  flatten: (styles: any) => styles,
  hairlineWidth: 1,
  absoluteFill: {},
  absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
}));

// Mock LayoutAnimation
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  configureNext: jest.fn(),
  create: jest.fn(),
  Types: {
    spring: 'spring',
    linear: 'linear',
    easeInEaseOut: 'easeInEaseOut',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    keyboard: 'keyboard',
  },
  Properties: {
    opacity: 'opacity',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    scaleXY: 'scaleXY',
  },
  Presets: {
    easeInEaseOut: {},
    linear: {},
    spring: {},
  },
}));

// Stub problematic UI components as simple functional components
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement('KeyboardAvoidingView', props, children),
  };
});

jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ data, renderItem, keyExtractor, ...props }: any) => {
      const items = data || [];
      return React.createElement(
        'FlatList',
        props,
        items.map((item: any, index: any) => {
          const key = keyExtractor ? keyExtractor(item, index) : index.toString();
          return React.createElement('div', { key }, renderItem ? renderItem({ item, index }) : null);
        })
      );
    },
  };
});

jest.mock('react-native/Libraries/Lists/VirtualizedList', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ data, renderItem, keyExtractor, getItem, getItemCount, ...props }: any) => {
      const itemCount = getItemCount ? getItemCount(data) : (data?.length || 0);
      const items: any[] = [];
      for (let i = 0; i < itemCount; i++) {
        const item = getItem ? getItem(data, i) : data[i];
        items.push(item);
      }
      return React.createElement(
        'VirtualizedList',
        props,
        items.map((item: any, index: any) => {
          const key = keyExtractor ? keyExtractor(item, index) : index.toString();
          return React.createElement('div', { key }, renderItem ? renderItem({ item, index }) : null);
        })
      );
    },
  };
});

jest.mock('react-native/Libraries/Components/Button', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ title, onPress, ...props }: any) => 
      React.createElement('Button', { ...props, onClick: onPress }, title),
  };
});

// Mock native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({}),
  get: () => ({}),
}));

try {
  (require as any).resolve('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}));
} catch {}
try {
  (require as any).resolve('react-native/Libraries/Animated/NativeAnimatedAllowlist');
  jest.mock('react-native/Libraries/Animated/NativeAnimatedAllowlist', () => ({
    shouldUseAnimatedObjectForTransform: () => false,
  }));
} catch {}

// Mock Dimensions
jest.mock('react-native/src/private/specs_DEPRECATED/modules/NativeDeviceInfo', () => ({
  getConstants: () => ({ 
    Dimensions: { 
      window: { width: 375, height: 667, scale: 2, fontScale: 1 },
      screen: { width: 375, height: 667, scale: 2, fontScale: 1 }
    } 
  }),
}));

// Mock InteractionManager
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => ({
  runAfterInteractions: (cb: any) => ({ 
    then: (fn: any) => fn && fn(), 
    cancel: () => {} 
  }),
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
}));

// Third-party library mocks
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  AntDesign: 'AntDesign',
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { 
    show: jest.fn(), 
    hide: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('expo-asset', () => ({
  Asset: { fromModule: () => ({ downloadAsync: async () => {} }) },
}));

jest.mock('expo-font', () => ({
  loadAsync: async () => {},
}));

// Override the main react-native export with stubbed components
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  const React = require('react');
  
  // Simple component stubs
  const View = ({ children, ...props }: any) => React.createElement('View', props, children);
  const Text = ({ children, ...props }: any) => React.createElement('Text', props, children);
  const ScrollView = ({ children, ...props }: any) => React.createElement('ScrollView', props, children);
  const TouchableOpacity = ({ children, onPress, ...props }: any) => 
    React.createElement('TouchableOpacity', { ...props, onClick: onPress }, children);

  return {
    ...rn,
    // Core components as stubs
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    
    // Already mocked components
    KeyboardAvoidingView: require('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView').default,
    FlatList: require('react-native/Libraries/Lists/FlatList').default,
    VirtualizedList: require('react-native/Libraries/Lists/VirtualizedList').default,
    Button: require('react-native/Libraries/Components/Button').default,
    
    // Platform
    Platform: require('react-native/Libraries/Utilities/Platform').default,
    
    // StyleSheet
    StyleSheet: require('react-native/Libraries/StyleSheet/StyleSheet'),
    
    // Dimensions
    useWindowDimensions: () => ({ width: 375, height: 667, scale: 2, fontScale: 1 }),
    Dimensions: {
      get: () => ({ width: 375, height: 667, scale: 2, fontScale: 1 }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    
    // LayoutAnimation
    LayoutAnimation: require('react-native/Libraries/LayoutAnimation/LayoutAnimation'),
  };
});