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
  plugins: [
    'expo-router',
    [
      'expo-image-picker',
      {
        cameraPermission: 'Allow ProofFlow to take job photos for the closeout record.',
        photosPermission: 'Allow ProofFlow to choose job photos from your library for the closeout record.',
      },
    ],
  ],
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
