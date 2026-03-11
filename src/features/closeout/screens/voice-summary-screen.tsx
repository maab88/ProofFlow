import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/ghost-button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextArea } from '@/components/ui/text-area';
import { CloseoutStepShell } from '@/features/closeout/components/closeout-step-shell';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import { getCloseoutStepRoute } from '@/features/closeout/lib/closeout-routes';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';

export function VoiceSummaryScreen() {
  const jobId = useCloseoutJobId();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));
  const updateVoiceSummary = useCloseoutDraftStore((state) => state.updateVoiceSummary);

  return (
    <CloseoutStepShell
      jobId={jobId}
      stepId="voice-summary"
      primaryAction={<PrimaryButton label="Continue to After Photos" onPress={() => jobId && router.push(getCloseoutStepRoute(jobId, 'after-photos'))} />}
      secondaryAction={<GhostButton label="Back" onPress={() => jobId && router.back()} />}
      footerNote="The transcript stays a draft assistant here. The final reviewed summary remains under your control before anything customer-facing is built."
    >
      <View className="gap-4">
        <Card className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-text-primary">Recording and transcript state</Text>
              <Text className="text-sm leading-6 text-text-secondary">This step is already shaped for recording, replay, draft transcript review, retries, and manual fallback later.</Text>
            </View>
            <StatusBadge label={draft?.voiceSummary.transcriptionStatus ?? 'idle'} tone="info" />
          </View>
          <View className="gap-2 rounded-card border border-border bg-surface-raised/80 px-4 py-4">
            <Text className="text-sm font-medium text-text-primary">Audio reference placeholder</Text>
            <Text className="text-sm leading-6 text-text-muted">
              {draft?.voiceSummary.audioReference.fileName ?? 'No recording yet. Later, this will hold a local audio reference, duration, and replay entry point.'}
            </Text>
          </View>
          <View className="gap-2 rounded-card border border-border bg-surface-raised/80 px-4 py-4">
            <Text className="text-sm font-medium text-text-primary">Transcript draft placeholder</Text>
            <Text className="text-sm leading-6 text-text-muted">
              {draft?.voiceSummary.transcriptDraftText
                ? draft.voiceSummary.transcriptDraftText
                : 'When transcription runs later, the raw draft will appear here first so it can be reviewed, corrected, retried, or ignored in favor of manual entry.'}
            </Text>
          </View>
        </Card>

        <Card className="gap-4">
          <Text className="text-base font-semibold text-text-primary">Editable summary draft</Text>
          <Text className="text-sm leading-6 text-text-secondary">
            When transcription arrives later, it should land as a draft. The contractor still reviews and edits the final work summary before trusting it.
          </Text>
          <TextArea
            label="Final reviewed work summary"
            placeholder="Type the trusted version of the work summary here if you want a manual fallback later."
            value={draft?.voiceSummary.finalWorkSummary ?? ''}
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
            <StatusBadge label={draft?.voiceSummary.recordingState ?? 'idle'} tone="neutral" />
            <StatusBadge label={draft?.voiceSummary.manualEntryAvailable ? 'Manual fallback ready' : 'Manual fallback off'} tone="info" />
            <StatusBadge label={draft?.voiceSummary.canRetryTranscription ? 'Retry available' : 'Retry placeholder'} tone="warning" />
          </View>
        </Card>
      </View>
    </CloseoutStepShell>
  );
}
