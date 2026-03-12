import { router } from 'expo-router';
import { Text, View, useWindowDimensions } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextArea } from '@/components/ui/text-area';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { useCloseoutVoiceSummaryStep } from '@/features/closeout/hooks/use-closeout-voice-summary-step';
import { getCloseoutStepRoute, getNextCloseoutStepLabel } from '@/features/closeout/lib/closeout-routes';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';

const speakingGuidance = ['Issue found', 'Work completed', 'Parts or materials used', 'Final result'];

export function VoiceSummaryScreen() {
  const { width } = useWindowDimensions();
  const jobId = useCloseoutJobId();
  const updateVoiceSummary = useCloseoutDraftStore((state) => state.updateVoiceSummary);
  const {
    canContinue,
    discardClip,
    isDeleting,
    isUploading,
    openSettings,
    pauseRecording,
    permissionDenied,
    playbackState,
    recorderErrorMessage,
    recordingState,
    resumeRecording,
    retryUpload,
    startRecording,
    stopRecording,
    storedVoiceNote,
    timerLabel,
    togglePlayback,
    voiceSummary,
  } = useCloseoutVoiceSummaryStep();

  const uploadTone =
    voiceSummary?.uploadStatus === 'uploaded'
      ? 'success'
      : voiceSummary?.uploadStatus === 'error'
        ? 'danger'
        : voiceSummary?.uploadStatus === 'uploading'
          ? 'info'
          : 'neutral';

  const playbackLabel = playbackState === 'playing' ? 'Pause playback' : 'Play recording';
  const hasUploadedClip = voiceSummary?.uploadStatus === 'uploaded' && Boolean(storedVoiceNote);
  const stackActions = width < 420;

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="voice-summary"
      primaryAction={
        <PrimaryButton
          label={getNextCloseoutStepLabel('voice-summary') ?? 'Next'}
          disabled={!canContinue}
          onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'after-photos'))}
        />
      }
      secondaryAction={<GhostButton label="Back" onPress={() => jobId && router.back()} />}
      footerNote="The recording becomes the source reference. Later, the transcript will only be a draft that you can correct before anything is sent."
    >
      <View className="gap-4">
        <Card className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-text-primary">Voice summary</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                Keep it short and clear. Say what you fixed, what you used, and the result. You&apos;ll be able to edit the summary before sending.
              </Text>
            </View>
            <StatusBadge label={voiceSummary?.uploadStatus ?? 'idle'} tone={uploadTone} />
          </View>

          <View className="rounded-card border border-border bg-surface-raised/70 px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Suggested speaking order</Text>
            <View className="mt-3 gap-2">
              {speakingGuidance.map((item) => (
                <View key={item} className="flex-row items-center gap-3">
                  <View className="h-2 w-2 rounded-full bg-primary" />
                  <Text className="text-sm text-text-secondary">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card className="gap-4">
          <View className="items-center gap-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary">Recording timer</Text>
            <Text className="text-5xl font-semibold tracking-[-1px] text-text-primary">{timerLabel}</Text>
            <View className="flex-row flex-wrap items-center justify-center gap-2">
              <StatusBadge label={recordingState} tone={recordingState === 'recording' ? 'danger' : recordingState === 'recorded' ? 'success' : 'neutral'} />
              <StatusBadge
                label={voiceSummary?.microphonePermissionStatus ?? 'unknown'}
                tone={permissionDenied ? 'warning' : 'info'}
              />
            </View>
          </View>

          {permissionDenied ? (
            <View className="gap-3 rounded-card border border-danger/30 bg-danger/10 px-4 py-4">
              <Text className="text-sm font-medium text-text-primary">Microphone access is off</Text>
              <Text className="text-sm leading-6 text-text-secondary">
                ProofFlow needs microphone access to capture the original clip for later replay and transcript review.
              </Text>
              <GhostButton label="Open settings" onPress={openSettings} />
            </View>
          ) : null}

          {recorderErrorMessage ? (
            <View className="gap-2 rounded-card border border-danger/30 bg-danger/10 px-4 py-4">
              <Text className="text-sm font-medium text-text-primary">Recording could not be saved</Text>
              <Text className="text-sm leading-6 text-danger">{recorderErrorMessage}</Text>
            </View>
          ) : null}

          {recordingState === 'idle' && !permissionDenied ? (
            <PrimaryButton label="Start recording" onPress={startRecording} />
          ) : null}

          {recordingState === 'recording' ? (
            <View className={stackActions ? 'gap-3' : 'flex-row gap-3'}>
              <View className={stackActions ? '' : 'flex-1'}>
                <GhostButton label="Pause" onPress={pauseRecording} />
              </View>
              <View className={stackActions ? '' : 'flex-1'}>
                <PrimaryButton label="Stop and save" onPress={stopRecording} />
              </View>
            </View>
          ) : null}

          {recordingState === 'paused' ? (
            <View className={stackActions ? 'gap-3' : 'flex-row gap-3'}>
              <View className={stackActions ? '' : 'flex-1'}>
                <GhostButton label="Resume" onPress={resumeRecording} />
              </View>
              <View className={stackActions ? '' : 'flex-1'}>
                <PrimaryButton label="Stop and save" onPress={stopRecording} />
              </View>
            </View>
          ) : null}

          {recordingState === 'recorded' ? (
            <View className="gap-3">
              <View className="gap-2 rounded-card border border-success/20 bg-success/10 px-4 py-4">
                <Text className="text-sm font-medium text-text-primary">
                  {hasUploadedClip ? 'Recording saved' : isUploading ? 'Saving recording' : 'Recording ready'}
                </Text>
                <Text className="text-sm leading-6 text-text-secondary">
                  {hasUploadedClip
                    ? 'The original clip is stored for replay, correction, and future transcript retries.'
                    : isUploading
                      ? 'ProofFlow is uploading the original audio now so it can be replayed and transcribed later.'
                      : 'You can replay, discard, or record again before this moves into the transcript draft step later.'}
                </Text>
              </View>

              {voiceSummary?.uploadErrorMessage ? (
                <View className="gap-3 rounded-card border border-danger/30 bg-danger/10 px-4 py-4">
                  <Text className="text-sm font-medium text-text-primary">Upload failed</Text>
                  <Text className="text-sm leading-6 text-danger">{voiceSummary.uploadErrorMessage}</Text>
                  <View className={stackActions ? 'gap-3' : 'flex-row gap-3'}>
                    <View className={stackActions ? '' : 'flex-1'}>
                      <PrimaryButton label="Retry upload" onPress={retryUpload} />
                    </View>
                    <View className={stackActions ? '' : 'flex-1'}>
                      <GhostButton label="Discard clip" onPress={discardClip} loading={isDeleting} />
                    </View>
                  </View>
                </View>
              ) : null}

              <View className={stackActions ? 'gap-3' : 'flex-row gap-3'}>
                <View className={stackActions ? '' : 'flex-1'}>
                  <GhostButton label={playbackLabel} onPress={togglePlayback} />
                </View>
                <View className={stackActions ? '' : 'flex-1'}>
                  <GhostButton label="Record again" onPress={startRecording} />
                </View>
              </View>

              <GhostButton label="Discard clip" onPress={discardClip} loading={isDeleting} />
            </View>
          ) : null}
        </Card>

        <Card className="gap-4">
          <View className="gap-1">
            <Text className="text-base font-semibold text-text-primary">Transcript draft comes next</Text>
            <Text className="text-sm leading-6 text-text-secondary">
              When transcription is added, it should land as a draft assistant here first. You stay in control of the final trusted work summary.
            </Text>
          </View>

          <TextArea
            label="Final reviewed work summary"
            placeholder="Type the trusted version here if you want to keep a manual summary ready."
            value={voiceSummary?.finalWorkSummary ?? ''}
            onChangeText={(value) => {
              if (!jobId) {
                return;
              }

              updateVoiceSummary(jobId, {
                finalWorkSummary: value,
                usedManualEntry: value.trim().length > 0,
                lastReviewedAt: value.trim().length > 0 ? new Date().toISOString() : null,
              });
            }}
          />

          <View className="flex-row flex-wrap gap-2">
            <StatusBadge label={voiceSummary?.transcriptionStatus ?? 'idle'} tone="info" />
            <StatusBadge label={voiceSummary?.manualEntryAvailable ? 'Manual summary ready' : 'Manual summary off'} tone="neutral" />
            <StatusBadge label={voiceSummary?.canRetryTranscription ? 'Retry available' : 'Retry later'} tone="warning" />
          </View>
        </Card>
      </View>
    </CloseoutStepShell>
  );
}
