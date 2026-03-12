import type { PhotoCategory } from '@/lib/domain/models';

export const closeoutPhotoKeys = {
  all: ['closeout-photos'] as const,
  list: (businessId: string, jobId: string, category: PhotoCategory) =>
    [...closeoutPhotoKeys.all, businessId, jobId, category] as const,
};
