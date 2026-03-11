import type { Href } from 'expo-router';

export function getPostAuthRoute(isOnboarded: boolean): Href {
  return (isOnboarded ? '/dashboard' : '/business-setup') as Href;
}
