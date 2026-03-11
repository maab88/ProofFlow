import type { ConfigContext, ExpoConfig } from 'expo/config';

const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'ProofFlow';
const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? 'proofflow';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: 'proofflow',
  scheme: appScheme,
  userInterfaceStyle: 'dark',
  orientation: 'portrait',
  newArchEnabled: true,
  experiments: {
    typedRoutes: true,
  },
  plugins: ['expo-router'],
  web: {
    bundler: 'metro',
  },
  android: {
    softwareKeyboardLayoutMode: 'pan',
  },
  extra: {
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  },
});
