import type { Href } from 'expo-router';

export function getCustomerDetailRoute(customerId: string): Href {
  return `/customers/${customerId}` as Href;
}

export function getCustomerEditRoute(customerId: string): Href {
  return `/customers/${customerId}/edit` as Href;
}

export const createCustomerRoute = '/customers/new' as Href;
export const customersRoute = '/customers' as Href;
