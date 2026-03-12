import { useEffect, useMemo, useState } from 'react';

import { Linking } from 'react-native';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAudioRecorder } from '@/features/closeout/hooks/use-audio-recorder';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { closeoutVoiceNoteKeys } from '@/features/closeout/hooks/closeout-voice-note-keys';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';
import {
  deleteCloseoutVoiceNote,
  getCloseoutVoiceNote,
  getCloseoutVoiceNoteErrorMessage,
  uploadCloseoutVoiceNote,
} from '@/features/closeout/services/closeout-voice-notes-service';

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function getSavedDurationSeconds(input: {
  recorderSeconds: number;
  localDurationSeconds: number | null | undefined;
  draftDurationSeconds: number | null | undefined;
  storedDurationSeconds: number | null | undefined;
}) {
  if (input.recorderSeconds > 0) {
    return input.recorderSeconds;
  }

  if ((input.localDurationSeconds ?? 0) > 0) {
    return input.localDurationSeconds ?? 0;
  }

  if ((input.draftDurationSeconds ?? 0) > 0) {
    return input.draftDurationSeconds ?? 0;
  }

  return input.storedDurationSeconds ?? 0;
}

export function useCloseoutVoiceSummaryStep() {
  const jobId = useCloseoutJobId();
  const queryClient = useQueryClient();
  const { business } = useAuth();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));
  const updateVoiceSummary = useCloseoutDraftStore((state) => state.updateVoiceSummary);
  const syncVoiceSummaryAudioReference = useCloseoutDraftStore((state) => state.syncVoiceSummaryAudioReference);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const recorder = useAudioRecorder();

  const voiceNoteQuery = useQuery({
    queryKey: jobId && business?.id ? closeoutVoiceNoteKeys.detail(business.id, jobId) : closeoutVoiceNoteKeys.all,
    queryFn: () => getCloseoutVoiceNote(business!.id, jobId!),
    enabled: Boolean(jobId && business?.id),
  });

  useEffect(() => {
    if (!jobId) {
      return;
    }

    if (recorder.permissionStatus === 'unknown') {
      return;
    }

    if (draft?.voiceSummary.microphonePermissionStatus === recorder.permissionStatus) {
      return;
    }

    updateVoiceSummary(jobId, {
      microphonePermissionStatus: recorder.permissionStatus,
    });
  }, [draft?.voiceSummary.microphonePermissionStatus, jobId, recorder.permissionStatus, updateVoiceSummary]);

  useEffect(() => {
    if (!jobId || !voiceNoteQuery.data || !draft) {
      return;
    }

    if (draft.voiceSummary.uploadStatus === 'uploading') {
      return;
    }

    const current = draft.voiceSummary.audioReference;
    const nextReference = {
      voiceNoteId: voiceNoteQuery.data.id,
      localUri: current.localUri,
      previewUrl: voiceNoteQuery.data.previewUrl,
      fileName: current.fileName ?? voiceNoteQuery.data.storagePath.split('/').pop() ?? 'voice-note.m4a',
      mimeType: current.mimeType ?? 'audio/mp4',
      storageBucket: voiceNoteQuery.data.storageBucket,
      storagePath: voiceNoteQuery.data.storagePath,
      durationSeconds: current.durationSeconds ?? voiceNoteQuery.data.durationSeconds,
      recordedAt: current.recordedAt ?? voiceNoteQuery.data.updatedAt,
    };

    const unchanged =
      current.voiceNoteId === nextReference.voiceNoteId &&
      current.localUri === nextReference.localUri &&
      current.previewUrl === nextReference.previewUrl &&
      current.fileName === nextReference.fileName &&
      current.mimeType === nextReference.mimeType &&
      current.storageBucket === nextReference.storageBucket &&
      current.storagePath === nextReference.storagePath &&
      current.durationSeconds === nextReference.durationSeconds &&
      current.recordedAt === nextReference.recordedAt;

    if (unchanged && draft.voiceSummary.uploadStatus === 'uploaded') {
      return;
    }

    syncVoiceSummaryAudioReference(jobId, nextReference);
    updateVoiceSummary(jobId, {
      recordingState: 'recorded',
      uploadStatus: 'uploaded',
      uploadErrorMessage: null,
    });
  }, [draft, jobId, syncVoiceSummaryAudioReference, updateVoiceSummary, voiceNoteQuery.data]);

  async function refreshVoiceNote() {
    if (!jobId || !business?.id) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: closeoutVoiceNoteKeys.detail(business.id, jobId),
    });
  }

  async function uploadClip(clip = recorder.clip) {
    if (!jobId || !business?.id || !clip) {
      return;
    }

    setIsUploading(true);
    updateVoiceSummary(jobId, {
      uploadStatus: 'uploading',
      uploadErrorMessage: null,
      recordingState: 'recorded',
    });

    try {
      const storedVoiceNote = await uploadCloseoutVoiceNote({
        businessId: business.id,
        jobId,
        localUri: clip.localUri,
        fileName: clip.fileName,
        mimeType: clip.mimeType,
        durationSeconds: clip.durationSeconds,
        recordedAt: clip.recordedAt,
      });

      syncVoiceSummaryAudioReference(jobId, {
        voiceNoteId: storedVoiceNote.id,
        localUri: clip.localUri,
        previewUrl: storedVoiceNote.previewUrl,
        fileName: clip.fileName,
        mimeType: clip.mimeType,
        storageBucket: storedVoiceNote.storageBucket,
        storagePath: storedVoiceNote.storagePath,
        durationSeconds: clip.durationSeconds,
        recordedAt: clip.recordedAt,
      });

      updateVoiceSummary(jobId, {
        uploadStatus: 'uploaded',
        uploadErrorMessage: null,
        recordingState: 'recorded',
        transcriptionStatus: 'idle',
        canRetryTranscription: false,
        lastTranscriptionError: null,
      });

      await refreshVoiceNote();
    } catch (error) {
      updateVoiceSummary(jobId, {
        uploadStatus: 'error',
        uploadErrorMessage: getCloseoutVoiceNoteErrorMessage(error as Error),
        recordingState: 'recorded',
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function startRecording() {
    if (!jobId) {
      return;
    }

    if (draft?.voiceSummary.recordingState === 'recorded' || voiceNoteQuery.data) {
      await discardClip();
    }

    await recorder.startRecording();
    updateVoiceSummary(jobId, {
      recordingState: 'recording',
      uploadStatus: 'idle',
      uploadErrorMessage: null,
      transcriptDraftText: '',
      transcriptionStatus: 'idle',
      canRetryTranscription: false,
      lastTranscriptionError: null,
    });
  }

  async function pauseRecording() {
    if (!jobId) {
      return;
    }

    await recorder.pauseRecording();
    updateVoiceSummary(jobId, {
      recordingState: 'paused',
    });
  }

  async function resumeRecording() {
    if (!jobId) {
      return;
    }

    await recorder.resumeRecording();
    updateVoiceSummary(jobId, {
      recordingState: 'recording',
    });
  }

  async function stopRecording() {
    if (!jobId) {
      return;
    }

    const clip = await recorder.stopRecording();
    if (!clip) {
      return;
    }

    syncVoiceSummaryAudioReference(jobId, {
      voiceNoteId: draft?.voiceSummary.audioReference.voiceNoteId ?? null,
      localUri: clip.localUri,
      previewUrl: draft?.voiceSummary.audioReference.previewUrl ?? null,
      fileName: clip.fileName,
      mimeType: clip.mimeType,
      storageBucket: draft?.voiceSummary.audioReference.storageBucket ?? null,
      storagePath: draft?.voiceSummary.audioReference.storagePath ?? null,
      durationSeconds: clip.durationSeconds,
      recordedAt: clip.recordedAt,
    });

    updateVoiceSummary(jobId, {
      recordingState: 'recorded',
      uploadStatus: 'uploading',
      uploadErrorMessage: null,
    });

    await uploadClip(clip);
  }

  async function discardClip() {
    if (!jobId || !business?.id) {
      await recorder.discardClip();
      return;
    }

    setIsDeleting(true);

    try {
      if (voiceNoteQuery.data) {
        await deleteCloseoutVoiceNote({
          businessId: business.id,
          jobId,
        });
      }

      await recorder.discardClip();

      syncVoiceSummaryAudioReference(jobId, {
        voiceNoteId: null,
        localUri: null,
        previewUrl: null,
        fileName: null,
        mimeType: null,
        storageBucket: null,
        storagePath: null,
        durationSeconds: null,
        recordedAt: null,
      });

      updateVoiceSummary(jobId, {
        recordingState: 'idle',
        uploadStatus: 'idle',
        uploadErrorMessage: null,
        transcriptionStatus: 'idle',
        canRetryTranscription: false,
        lastTranscriptionError: null,
      });

      await refreshVoiceNote();
    } finally {
      setIsDeleting(false);
    }
  }

  async function retryUpload() {
    if (!recorder.clip || isUploading) {
      return;
    }

    await uploadClip();
  }

  async function togglePlayback() {
    const audioUri = recorder.clip?.localUri ?? draft?.voiceSummary.audioReference.previewUrl ?? voiceNoteQuery.data?.previewUrl;

    if (!audioUri) {
      return;
    }

    await recorder.togglePlayback(audioUri);
  }

  const canContinue = !isUploading && draft?.voiceSummary.recordingState !== 'recording';
  const hasRecordedClip = Boolean(recorder.clip || voiceNoteQuery.data || draft?.voiceSummary.audioReference.previewUrl);
  const effectiveRecordingState = recorder.recordingState === 'idle' && hasRecordedClip ? 'recorded' : recorder.recordingState;
  const displaySeconds = getSavedDurationSeconds({
    recorderSeconds: recorder.recordingSeconds,
    localDurationSeconds: recorder.clip?.durationSeconds,
    draftDurationSeconds: draft?.voiceSummary.audioReference.durationSeconds,
    storedDurationSeconds: voiceNoteQuery.data?.durationSeconds,
  });
  const timerLabel = formatDuration(displaySeconds);

  return useMemo(
    () => ({
      canContinue,
      hasRecordedClip,
      isDeleting,
      isUploading,
      jobId,
      openSettings: () => Linking.openSettings(),
      permissionDenied:
        draft?.voiceSummary.microphonePermissionStatus === 'denied' || recorder.permissionStatus === 'denied',
      playbackState: recorder.playbackState,
      recorderErrorMessage: recorder.errorMessage,
      recordingState: effectiveRecordingState,
      storedVoiceNote: voiceNoteQuery.data,
      timerLabel,
      voiceSummary: draft?.voiceSummary,
      voiceNoteQuery,
      discardClip,
      pauseRecording,
      resumeRecording,
      retryUpload,
      startRecording,
      stopPlayback: recorder.stopPlayback,
      stopRecording,
      togglePlayback,
    }),
    [
      canContinue,
      discardClip,
      draft?.voiceSummary,
      hasRecordedClip,
      isDeleting,
      isUploading,
      jobId,
      pauseRecording,
      recorder.permissionStatus,
      recorder.errorMessage,
      recorder.playbackState,
      recorder.recordingState,
      effectiveRecordingState,
      recorder.stopPlayback,
      resumeRecording,
      retryUpload,
      startRecording,
      stopRecording,
      displaySeconds,
      timerLabel,
      togglePlayback,
      voiceNoteQuery,
      voiceNoteQuery.data,
    ],
  );
}
