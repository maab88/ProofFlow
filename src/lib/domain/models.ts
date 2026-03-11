import type { Database } from '@/lib/supabase/database.types';

export type JobStatus = Database['public']['Enums']['job_status'];
export type PhotoCategory = Database['public']['Enums']['photo_category'];
export type InvoicePaymentStatus = Database['public']['Enums']['invoice_payment_status'];
export type InvoiceLineItemType = Database['public']['Enums']['invoice_line_item_type'];
export type MessageType = Database['public']['Enums']['message_type'];
export type MessageDeliveryStatus = Database['public']['Enums']['message_delivery_status'];

export type Money = {
  amountCents: number;
  currencyCode: 'CAD' | 'USD';
};

export type User = {
  id: string;
  businessId: string;
  authUserId: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Business = {
  id: string;
  ownerUserId: string | null;
  legalName: string;
  displayName: string;
  defaultCurrencyCode: 'CAD' | 'USD';
  timeZone: string;
  logoStoragePath: string | null;
  defaultHourlyRateCents: number | null;
  taxLabel: string | null;
  taxRateBasisPoints: number | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  businessId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Job = {
  id: string;
  businessId: string;
  customerId: string;
  createdByUserId: string;
  title: string;
  siteAddressLine1: string | null;
  siteAddressLine2: string | null;
  siteCity: string | null;
  siteRegion: string | null;
  sitePostalCode: string | null;
  status: JobStatus;
  scheduledFor: string | null;
  completedAt: string | null;
  workSummaryDraft: string | null;
  workSummaryFinal: string | null;
  laborAmountCents: number;
  partsAmountCents: number;
  taxAmountCents: number;
  totalAmountCents: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobPhoto = {
  id: string;
  jobId: string;
  businessId: string;
  category: PhotoCategory;
  storageBucket: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sortOrder: number;
  capturedAt: string | null;
  createdAt: string;
};

export type VoiceNote = {
  id: string;
  jobId: string;
  businessId: string;
  storageBucket: string;
  storagePath: string;
  durationSeconds: number | null;
  transcriptDraft: string | null;
  transcriptFinal: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  jobId: string;
  businessId: string;
  customerId: string;
  invoiceNumber: string;
  paymentStatus: InvoicePaymentStatus;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currencyCode: 'CAD' | 'USD';
  paymentLinkUrl: string | null;
  pdfStorageBucket: string | null;
  pdfStoragePath: string | null;
  sentAt: string | null;
  paidAt: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceLineItem = {
  id: string;
  invoiceId: string;
  businessId: string;
  lineType: InvoiceLineItemType;
  description: string;
  quantity: string;
  unitAmountCents: number;
  totalAmountCents: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  businessId: string;
  invoiceId: string;
  customerId: string;
  type: MessageType;
  deliveryStatus: MessageDeliveryStatus;
  recipient: string;
  subject: string | null;
  body: string | null;
  providerMessageId: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
};
