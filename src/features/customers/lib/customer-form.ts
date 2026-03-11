import { z } from 'zod';

export const customerFormSchema = z.object({
  fullName: z.string().min(2, 'Enter the customer\'s full name.'),
  phone: z
    .string()
    .trim()
    .max(30, 'Keep the phone number under 30 characters.')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(240, 'Keep the address under 240 characters.').optional().or(z.literal('')),
  notes: z.string().trim().max(500, 'Keep notes under 500 characters.').optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function getCustomerFormDefaults(customer?: {
  displayName: string;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  notes: string | null;
}): CustomerFormValues {
  return {
    fullName: customer?.displayName ?? '',
    phone: customer?.phone ?? '',
    email: customer?.email ?? '',
    address: customer?.addressLine1 ?? '',
    notes: customer?.notes ?? '',
  };
}
