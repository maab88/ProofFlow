import { File } from 'expo-file-system';

import type { VoiceNote } from '@/lib/domain/models';
import { STORAGE_BUCKETS, storagePaths } from '@/lib/domain/storage-paths';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type VoiceNoteRow = Database['public']['Tables']['voice_notes']['Row'];

export type StoredCloseoutVoiceNote = VoiceNote & {
  previewUrl: string;
};

export type UploadCloseoutVoiceNoteInput = {
  businessId: string;
  jobId: string;
  localUri: string;
  fileName: string;
  mimeType: string;
  durationSeconds: number;
  recordedAt: string;
};

function mapVoiceNote(row: VoiceNoteRow): VoiceNote {
  return {
    id: row.id,
    jobId: row.job_id,
    businessId: row.business_id,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    durationSeconds: row.duration_seconds,
    transcriptDraft: row.transcript_draft,
    transcriptFinal: row.transcript_final,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

async function createPreviewUrl(bucket: string, path: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

async function getCloseoutVoiceNoteRow(businessId: string, jobId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('voice_notes')
    .select('*')
    .eq('business_id', businessId)
    .eq('job_id', jobId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as VoiceNoteRow | null) ?? null;
}

function inferAudioFile(fileName: string, mimeType: string, uri: string) {
  const normalizedName = fileName.toLowerCase();
  const normalizedUri = uri.toLowerCase();

  if (normalizedName.endsWith('.wav') || normalizedUri.endsWith('.wav') || mimeType === 'audio/wav') {
    return { extension: 'wav', outputMimeType: 'audio/wav' };
  }

  if (normalizedName.endsWith('.mp3') || normalizedUri.endsWith('.mp3') || mimeType === 'audio/mpeg') {
    return { extension: 'mp3', outputMimeType: 'audio/mpeg' };
  }

  if (normalizedName.endsWith('.caf') || normalizedUri.endsWith('.caf') || mimeType === 'audio/x-caf') {
    return { extension: 'caf', outputMimeType: 'audio/x-caf' };
  }

  return { extension: 'm4a', outputMimeType: 'audio/mp4' };
}

export function getCloseoutVoiceNoteErrorMessage(error: Error | null | undefined) {
  if (!error) {
    return 'Something went wrong while handling the recording.';
  }

  const message = error.message.toLowerCase();

  if (message.includes('row-level security') || message.includes('violates row-level security')) {
    return 'ProofFlow is connected, but your Supabase access rules are still blocking this recording upload.';
  }

  if (message.includes('permission')) {
    return 'ProofFlow does not have microphone access yet.';
  }

  if (message.includes('network')) {
    return 'Your recording could not upload because the connection dropped. Try again in a moment.';
  }

  if (message.includes('read') || message.includes('file')) {
    return 'ProofFlow could not read the recorded clip from this device. Try recording again.';
  }

  return error.message;
}

export async function getCloseoutVoiceNote(businessId: string, jobId: string) {
  const row = await getCloseoutVoiceNoteRow(businessId, jobId);

  if (!row) {
    return null;
  }

  return {
    ...mapVoiceNote(row),
    previewUrl: await createPreviewUrl(row.storage_bucket, row.storage_path),
  } satisfies StoredCloseoutVoiceNote;
}

export async function uploadCloseoutVoiceNote(input: UploadCloseoutVoiceNoteInput) {
  const supabase = getSupabaseClient();
  const existingRow = await getCloseoutVoiceNoteRow(input.businessId, input.jobId);
  const voiceNoteId = existingRow?.id ?? createUuid();
  const target = inferAudioFile(input.fileName, input.mimeType, input.localUri);
  const storagePath = storagePaths.voiceNote({
    businessId: input.businessId,
    jobId: input.jobId,
    voiceNoteId,
    extension: target.extension,
  });

  const file = new File(input.localUri);
  const fileBytes = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage.from(STORAGE_BUCKETS.jobMedia).upload(storagePath, fileBytes, {
    contentType: target.outputMimeType,
    upsert: true,
  });

  if (storageError) {
    throw storageError;
  }

  const { data, error: upsertError } = await supabase
    .from('voice_notes')
    .upsert(
      {
        id: voiceNoteId,
        business_id: input.businessId,
        job_id: input.jobId,
        storage_bucket: STORAGE_BUCKETS.jobMedia,
        storage_path: storagePath,
        duration_seconds: input.durationSeconds,
      },
      { onConflict: 'job_id' },
    )
    .select('*')
    .single();

  if (upsertError) {
    throw upsertError;
  }

  if (existingRow?.storage_path && existingRow.storage_path !== storagePath) {
    await supabase.storage.from(STORAGE_BUCKETS.jobMedia).remove([existingRow.storage_path]);
  }

  return {
    ...mapVoiceNote(data as VoiceNoteRow),
    previewUrl: await createPreviewUrl(STORAGE_BUCKETS.jobMedia, storagePath),
  };
}

export async function deleteCloseoutVoiceNote(input: { businessId: string; jobId: string }) {
  const supabase = getSupabaseClient();
  const existing = await getCloseoutVoiceNoteRow(input.businessId, input.jobId);

  if (!existing) {
    return;
  }

  const { error: storageError } = await supabase.storage.from(existing.storage_bucket).remove([existing.storage_path]);

  if (storageError) {
    throw storageError;
  }

  const { error } = await supabase.from('voice_notes').delete().eq('id', existing.id).eq('business_id', input.businessId).eq('job_id', input.jobId);

  if (error) {
    throw error;
  }
}
