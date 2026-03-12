import { useEffect, useMemo } from 'react';
import { Linking } from 'react-native';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { closeoutPhotoKeys } from '@/features/closeout/hooks/closeout-photo-keys';
import { useCloseoutJobId } from '@/features/closeout/hooks/use-closeout-job-id';
import type { CloseoutPendingPhotoUpload, CloseoutPhotoSource, CloseoutPhotoStepKey } from '@/features/closeout/lib/closeout-types';
import { useCloseoutDraftStore } from '@/features/closeout/store/use-closeout-draft-store';
import {
  deleteCloseoutPhoto,
  getCloseoutPhotoErrorMessage,
  listCloseoutPhotos,
  reorderCloseoutPhotos,
  type StoredCloseoutPhoto,
  uploadCloseoutPhoto,
} from '@/features/closeout/services/closeout-photos-service';
import type { PhotoCategory } from '@/lib/domain/models';

type UseCloseoutPhotoStepOptions = {
  stepKey: CloseoutPhotoStepKey;
  category: PhotoCategory;
};

export function useCloseoutPhotoStep({ stepKey, category }: UseCloseoutPhotoStepOptions) {
  const jobId = useCloseoutJobId();
  const queryClient = useQueryClient();
  const { business } = useAuth();
  const draft = useCloseoutDraftStore((state) => (jobId ? state.drafts[jobId] : undefined));
  const setPhotoPermission = useCloseoutDraftStore((state) => state.setPhotoPermission);
  const enqueuePendingUploads = useCloseoutDraftStore((state) => state.enqueuePendingUploads);
  const updatePendingUpload = useCloseoutDraftStore((state) => state.updatePendingUpload);
  const removePendingUpload = useCloseoutDraftStore((state) => state.removePendingUpload);
  const syncPhotoItemCount = useCloseoutDraftStore((state) => state.syncPhotoItemCount);

  const photosQuery = useQuery({
    queryKey: jobId && business?.id ? closeoutPhotoKeys.list(business.id, jobId, category) : closeoutPhotoKeys.all,
    queryFn: () => listCloseoutPhotos(business!.id, jobId!, category),
    enabled: Boolean(jobId && business?.id),
  });

  const pendingUploads = draft?.[stepKey].pendingUploads ?? [];
  const permissionStatus = draft?.[stepKey].permissionStatus ?? 'unknown';
  const storedPhotos = photosQuery.data ?? [];

  useEffect(() => {
    if (!jobId) {
      return;
    }

    syncPhotoItemCount(jobId, stepKey, storedPhotos.length + pendingUploads.length);
  }, [jobId, pendingUploads.length, stepKey, storedPhotos.length, syncPhotoItemCount]);

  const isUploading = pendingUploads.some((upload) => upload.status !== 'error');
  const hasPhotos = storedPhotos.length > 0 || pendingUploads.length > 0;
  const uploadPercent =
    pendingUploads.length > 0
      ? Math.round(pendingUploads.reduce((sum, item) => sum + item.progress, 0) / pendingUploads.length)
      : 0;

  async function refreshPhotos() {
    if (!jobId || !business?.id) {
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: closeoutPhotoKeys.list(business.id, jobId, category),
    });
  }

  async function resolvePermission(source: 'camera' | 'library') {
    const permission =
      source === 'camera'
        ? await ImagePicker.getCameraPermissionsAsync()
        : await ImagePicker.getMediaLibraryPermissionsAsync();

    if (permission.granted) {
      if (jobId) {
        setPhotoPermission(jobId, stepKey, 'granted');
      }

      return true;
    }

    const requested =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    const nextStatus = requested.granted ? 'granted' : 'denied';

    if (jobId) {
      setPhotoPermission(jobId, stepKey, nextStatus);
    }

    return requested.granted;
  }

  async function ensureCameraPermission() {
    return resolvePermission('camera');
  }

  async function ensureLibraryPermission() {
    return resolvePermission('library');
  }

  async function uploadPendingPhoto(upload: CloseoutPendingPhotoUpload, sortOrder: number) {
    if (!jobId || !business?.id) {
      return false;
    }

    try {
      updatePendingUpload(jobId, stepKey, upload.localId, {
        status: 'compressing',
        progress: 20,
        errorMessage: null,
      });

      updatePendingUpload(jobId, stepKey, upload.localId, {
        status: 'uploading',
        progress: 60,
      });

      await uploadCloseoutPhoto({
        businessId: business.id,
        jobId,
        category,
        localUri: upload.localUri,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
        capturedAt: upload.capturedAt,
        sortOrder,
      });

      updatePendingUpload(jobId, stepKey, upload.localId, {
        status: 'saving',
        progress: 90,
      });

      removePendingUpload(jobId, stepKey, upload.localId);
      return true;
    } catch (error) {
      updatePendingUpload(jobId, stepKey, upload.localId, {
        status: 'error',
        progress: 0,
        errorMessage: getCloseoutPhotoErrorMessage(error as Error),
      });

      return false;
    }
  }

  async function processPickedAssets(assets: ImagePicker.ImagePickerAsset[], source: CloseoutPhotoSource) {
    if (!jobId || !business?.id || assets.length === 0) {
      return;
    }

    const prepared = assets.map((asset) => ({
      localId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      localUri: asset.uri,
      fileName: asset.fileName ?? `${category}-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
      source,
      progress: 0,
      status: 'queued' as const,
      errorMessage: null,
      capturedAt: new Date().toISOString(),
    }));

    enqueuePendingUploads(jobId, stepKey, prepared);

    const baseSortOrder = storedPhotos.length + pendingUploads.length;

    let uploadedAny = false;

    for (const [index, upload] of prepared.entries()) {
      const didUpload = await uploadPendingPhoto(upload, baseSortOrder + index);
      uploadedAny = uploadedAny || didUpload;
    }

    if (uploadedAny) {
      await refreshPhotos();
    }
  }

  async function takePhoto() {
    const granted = await ensureCameraPermission();
    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    await processPickedAssets(result.assets, 'camera');
  }

  async function chooseFromLibrary() {
    const granted = await ensureLibraryPermission();
    if (!granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      orderedSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (result.canceled) {
      return;
    }

    await processPickedAssets(result.assets, 'library');
  }

  async function retryUpload(localId: string) {
    const upload = pendingUploads.find((item) => item.localId === localId);
    if (!upload || !jobId) {
      return;
    }

    const didUpload = await uploadPendingPhoto(upload, storedPhotos.length);
    if (didUpload) {
      await refreshPhotos();
    }
  }

  function removePending(localId: string) {
    if (!jobId) {
      return;
    }

    removePendingUpload(jobId, stepKey, localId);
  }

  async function deleteStoredPhoto(photo: StoredCloseoutPhoto) {
    if (!jobId || !business?.id) {
      return;
    }

    await deleteCloseoutPhoto(photo);
    await refreshPhotos();
  }

  async function reorderStoredPhoto(photoId: string, direction: 'earlier' | 'later') {
    if (!jobId || !business?.id) {
      return;
    }

    const currentIndex = storedPhotos.findIndex((photo) => photo.id === photoId);
    const nextIndex = direction === 'earlier' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= storedPhotos.length) {
      return;
    }

    const reordered = [...storedPhotos];
    const [photo] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, photo);

    await reorderCloseoutPhotos({
      businessId: business.id,
      jobId,
      category,
      orderedPhotoIds: reordered.map((item) => item.id),
    });

    await refreshPhotos();
  }

  const permissionDenied = permissionStatus === 'denied';

  return useMemo(
    () => ({
      business,
      hasPhotos,
      isUploading,
      jobId,
      permissionDenied,
      permissionStatus,
      photosQuery,
      pendingUploads,
      storedPhotos,
      uploadPercent,
      chooseFromLibrary,
      deleteStoredPhoto,
      openSettings: () => Linking.openSettings(),
      removePending,
      reorderStoredPhoto,
      retryUpload,
      takePhoto,
    }),
    [
      business,
      chooseFromLibrary,
      deleteStoredPhoto,
      hasPhotos,
      isUploading,
      jobId,
      pendingUploads,
      permissionDenied,
      permissionStatus,
      photosQuery,
      removePending,
      reorderStoredPhoto,
      retryUpload,
      storedPhotos,
      takePhoto,
      uploadPercent,
    ],
  );
}
