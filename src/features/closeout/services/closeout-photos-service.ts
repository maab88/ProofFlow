import { File } from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import type { JobPhoto, PhotoCategory } from '@/lib/domain/models';
import { STORAGE_BUCKETS, storagePaths } from '@/lib/domain/storage-paths';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type JobPhotoRow = Database['public']['Tables']['job_photos']['Row'];

export type StoredCloseoutPhoto = JobPhoto & {
  previewUrl: string;
};

export type UploadCloseoutPhotoInput = {
  businessId: string;
  jobId: string;
  category: PhotoCategory;
  localUri: string;
  fileName: string;
  mimeType: string;
  capturedAt: string;
  sortOrder: number;
};

function mapJobPhoto(row: JobPhotoRow): JobPhoto {
  return {
    id: row.id,
    jobId: row.job_id,
    businessId: row.business_id,
    category: row.category,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sortOrder: row.sort_order,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
  };
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function inferExtension(fileName: string, mimeType: string) {
  const cleanName = fileName.toLowerCase();

  if (cleanName.endsWith('.png') || mimeType === 'image/png') {
    return { extension: 'png', format: SaveFormat.PNG, outputMimeType: 'image/png' };
  }

  if (cleanName.endsWith('.webp') || mimeType === 'image/webp') {
    return { extension: 'webp', format: SaveFormat.WEBP, outputMimeType: 'image/webp' };
  }

  return { extension: 'jpg', format: SaveFormat.JPEG, outputMimeType: 'image/jpeg' };
}

async function createPreviewUrl(bucket: string, path: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

async function compressImage(input: Pick<UploadCloseoutPhotoInput, 'localUri' | 'fileName' | 'mimeType'>) {
  const target = inferExtension(input.fileName, input.mimeType);
  const result = await manipulateAsync(input.localUri, [{ resize: { width: 1600 } }], {
    compress: 0.72,
    format: target.format,
  });

  return {
    uri: result.uri,
    fileName: normalizeFileName(input.fileName, target.extension),
    mimeType: target.outputMimeType,
    extension: target.extension,
  };
}

function normalizeFileName(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'photo';
  return `${baseName}.${extension}`;
}

export function getCloseoutPhotoErrorMessage(error: Error | null | undefined) {
  if (!error) {
    return 'Something went wrong while handling the photo.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('row-level security') || message.includes('violates row-level security')) {
    return 'ProofFlow is connected, but your Supabase storage rules are still blocking photo uploads. Apply the latest storage policy migration, then try again.';
  }

  if (message.includes('permission')) {
    return 'ProofFlow does not have permission to use that photo source yet.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'ProofFlow could not read the photo file for upload. Try the photo again once the capture finishes saving.';
  }

  if (message.includes('storage')) {
    return 'The photo could not be stored right now. Please try again.';
  }

  return error.message;
}

export async function listCloseoutPhotos(businessId: string, jobId: string, category: PhotoCategory) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('job_photos')
    .select('*')
    .eq('business_id', businessId)
    .eq('job_id', jobId)
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as JobPhotoRow[];

  return Promise.all(
    rows.map(async (row) => ({
      ...mapJobPhoto(row),
      previewUrl: await createPreviewUrl(row.storage_bucket, row.storage_path),
    })),
  );
}

export async function uploadCloseoutPhoto(input: UploadCloseoutPhotoInput) {
  const supabase = getSupabaseClient();
  const photoId = createUuid();
  const compressed = await compressImage({
    localUri: input.localUri,
    fileName: input.fileName,
    mimeType: input.mimeType,
  });
  const storagePath = storagePaths.jobPhoto({
    businessId: input.businessId,
    jobId: input.jobId,
    category: input.category,
    photoId,
    extension: compressed.extension,
  });

  const file = new File(compressed.uri);
  const fileBytes = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage.from(STORAGE_BUCKETS.jobMedia).upload(storagePath, fileBytes, {
    contentType: compressed.mimeType,
    upsert: false,
  });

  if (storageError) {
    throw storageError;
  }

  const { data, error: insertError } = await supabase
    .from('job_photos')
    .insert({
      id: photoId,
      business_id: input.businessId,
      job_id: input.jobId,
      category: input.category,
      storage_bucket: STORAGE_BUCKETS.jobMedia,
      storage_path: storagePath,
      file_name: compressed.fileName,
      mime_type: compressed.mimeType,
      sort_order: input.sortOrder,
      captured_at: input.capturedAt,
    })
    .select('*')
    .single();

  if (insertError) {
    await supabase.storage.from(STORAGE_BUCKETS.jobMedia).remove([storagePath]);
    throw insertError;
  }

  return {
    ...mapJobPhoto(data as JobPhotoRow),
    previewUrl: await createPreviewUrl(STORAGE_BUCKETS.jobMedia, storagePath),
  } satisfies StoredCloseoutPhoto;
}

export async function deleteCloseoutPhoto(photo: Pick<StoredCloseoutPhoto, 'id' | 'businessId' | 'storageBucket' | 'storagePath'>) {
  const supabase = getSupabaseClient();
  const { error: storageError } = await supabase.storage.from(photo.storageBucket).remove([photo.storagePath]);

  if (storageError) {
    throw storageError;
  }

  const { error } = await supabase.from('job_photos').delete().eq('id', photo.id).eq('business_id', photo.businessId);

  if (error) {
    throw error;
  }
}

export async function reorderCloseoutPhotos(input: {
  businessId: string;
  jobId: string;
  category: PhotoCategory;
  orderedPhotoIds: string[];
}) {
  const supabase = getSupabaseClient();

  for (const [index, photoId] of input.orderedPhotoIds.entries()) {
    const { error } = await supabase
      .from('job_photos')
      .update({ sort_order: index })
      .eq('id', photoId)
      .eq('business_id', input.businessId)
      .eq('job_id', input.jobId)
      .eq('category', input.category);

    if (error) {
      throw error;
    }
  }
}
