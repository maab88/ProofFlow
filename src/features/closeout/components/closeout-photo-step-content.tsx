import { Image, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { GhostButton } from '@/components/ui/ghost-button';
import { IconButton } from '@/components/ui/icon-button';
import { LoadingState } from '@/components/ui/loading-state';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SecondaryButton } from '@/components/ui/secondary-button';
import { StatusBadge } from '@/components/ui/status-badge';
import type { useCloseoutPhotoStep } from '@/features/closeout/hooks/use-closeout-photo-step';

type PhotoStepState = ReturnType<typeof useCloseoutPhotoStep>;

type CloseoutPhotoStepContentProps = {
  category: 'before' | 'after';
  state: PhotoStepState;
};

function PendingUploadCard({
  item,
  onRetry,
  onDelete,
}: {
  item: PhotoStepState['pendingUploads'][number];
  onRetry: () => void;
  onDelete: () => void;
}) {
  const tone = item.status === 'error' ? 'danger' : 'info';
  const label =
    item.status === 'error'
      ? 'Upload failed'
      : item.status === 'compressing'
        ? 'Compressing'
        : item.status === 'saving'
          ? 'Saving record'
          : item.status === 'uploading'
            ? `Uploading ${item.progress}%`
            : 'Queued';

  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row gap-3">
        <Image className="h-24 w-24 rounded-[18px] bg-surface-raised" source={{ uri: item.localUri }} />
        <View className="flex-1 gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-text-primary">{item.fileName}</Text>
              <Text className="text-sm text-text-muted">{item.source === 'camera' ? 'Captured now' : 'Selected from library'}</Text>
            </View>
            <StatusBadge label={label} tone={tone} />
          </View>
          {item.errorMessage ? <Text className="text-sm leading-5 text-danger">{item.errorMessage}</Text> : null}
          <View className="flex-row justify-end gap-2">
            {item.status === 'error' ? <GhostButton fullWidth={false} label="Retry" onPress={onRetry} /> : null}
            <GhostButton fullWidth={false} label="Remove" onPress={onDelete} />
          </View>
        </View>
      </View>
    </Card>
  );
}

function StoredPhotoCard({
  category,
  index,
  photo,
  canMoveEarlier,
  canMoveLater,
  onMoveEarlier,
  onMoveLater,
  onDelete,
}: {
  category: 'before' | 'after';
  index: number;
  photo: PhotoStepState['storedPhotos'][number];
  canMoveEarlier: boolean;
  canMoveLater: boolean;
  onMoveEarlier: () => void;
  onMoveLater: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row gap-3">
        <Image className="h-24 w-24 rounded-[18px] bg-surface-raised" source={{ uri: photo.previewUrl }} />
        <View className="flex-1 gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="text-base font-semibold text-text-primary">Photo {index + 1}</Text>
              <Text className="text-sm text-text-muted">{photo.fileName}</Text>
            </View>
            <StatusBadge label={category === 'before' ? 'Before' : 'After'} tone={category === 'before' ? 'info' : 'success'} />
          </View>
          <Text className="text-sm leading-5 text-text-secondary">
            {photo.capturedAt ? new Date(photo.capturedAt).toLocaleString() : 'Captured time unavailable'}
          </Text>
          <View className="flex-row justify-end gap-2">
            <IconButton accessibilityLabel="Move photo earlier" disabled={!canMoveEarlier} icon="arrow-up" onPress={onMoveEarlier} />
            <IconButton accessibilityLabel="Move photo later" disabled={!canMoveLater} icon="arrow-down" onPress={onMoveLater} />
            <IconButton accessibilityLabel="Delete photo" icon="trash-outline" onPress={onDelete} />
          </View>
        </View>
      </View>
    </Card>
  );
}

export function CloseoutPhotoStepContent({ category, state }: CloseoutPhotoStepContentProps) {
  if (state.photosQuery.isLoading) {
    return <LoadingState label={`Loading ${category} photos`} />;
  }

  if (state.photosQuery.isError) {
    return (
      <ErrorState
        title={`Could not load ${category} photos`}
        description="The photo list needs a refresh before this step can continue confidently."
        actionLabel="Try again"
        onAction={() => void state.photosQuery.refetch()}
      />
    );
  }

  return (
    <View className="gap-4">
      <Card className="gap-4">
        <View className="gap-2">
          <Text className="text-base font-semibold text-text-primary">
            {category === 'before' ? 'Capture the starting condition' : 'Capture the finished result'}
          </Text>
          <Text className="text-sm leading-6 text-text-secondary">
            {category === 'before'
              ? 'Get quick proof of what you started with before the work changes the job site.'
              : 'Add the final proof set right after the work is complete while the result is still clear.'}
          </Text>
        </View>
        <PrimaryButton
          disabled={state.isUploading}
          label={category === 'before' ? 'Take before photo' : 'Take after photo'}
          loading={state.isUploading}
          onPress={() => void state.takePhoto()}
        />
        <SecondaryButton disabled={state.isUploading} label="Choose from library" onPress={() => void state.chooseFromLibrary()} />
      </Card>

      {state.permissionDenied ? (
        <Card className="gap-3 border-warning bg-warning/5">
          <Text className="text-base font-semibold text-text-primary">Photo access is blocked</Text>
          <Text className="text-sm leading-6 text-text-secondary">
            ProofFlow needs camera or library access to collect proof photos. You can enable access in system settings and then try again.
          </Text>
          <GhostButton label="Open settings" onPress={() => void state.openSettings()} />
        </Card>
      ) : null}

      {state.isUploading ? (
        <Card className="gap-2 bg-surface-raised/70">
          <Text className="text-sm font-medium text-text-primary">Uploading in progress</Text>
          <Text className="text-sm leading-6 text-text-muted">
            {state.pendingUploads.length} photo{state.pendingUploads.length === 1 ? '' : 's'} moving to secure storage. Overall progress: {state.uploadPercent}%.
          </Text>
        </Card>
      ) : null}

      {!state.hasPhotos ? (
        <EmptyState
          title={category === 'before' ? 'No before photos yet' : 'No after photos yet'}
          description={
            category === 'before'
              ? 'Take a quick starting-condition photo or choose one from the library to begin the proof set.'
              : 'Add the finished-condition photo set so the closeout record is easy to trust.'
          }
        />
      ) : null}

      {state.pendingUploads.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-[1.6px] text-text-muted">Pending uploads</Text>
          {state.pendingUploads.map((item) => (
            <PendingUploadCard
              item={item}
              key={item.localId}
              onDelete={() => state.removePending(item.localId)}
              onRetry={() => void state.retryUpload(item.localId)}
            />
          ))}
        </View>
      ) : null}

      {state.storedPhotos.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-[1.6px] text-text-muted">
            {category === 'before' ? 'Before proof set' : 'After proof set'}
          </Text>
          {state.storedPhotos.map((photo, index) => (
            <StoredPhotoCard
              canMoveEarlier={index > 0}
              canMoveLater={index < state.storedPhotos.length - 1}
              category={category}
              index={index}
              key={photo.id}
              onDelete={() => void state.deleteStoredPhoto(photo)}
              onMoveEarlier={() => void state.reorderStoredPhoto(photo.id, 'earlier')}
              onMoveLater={() => void state.reorderStoredPhoto(photo.id, 'later')}
              photo={photo}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
