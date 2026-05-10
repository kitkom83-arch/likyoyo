"use client";

import { BuilderData } from "@/features/builder/types";

const IMAGE_DB_NAME = "linkbio-image-db-v1";
const IMAGE_STORE_NAME = "images";
const IMAGE_REF_PREFIX = "idbimg:";

type ImageRecord = {
  id: string;
  dataUrl: string;
  updatedAt: number;
};

type AdminImageUploadResponse = {
  url?: unknown;
  error?: unknown;
};

const openImageDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = window.indexedDB.open(IMAGE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        database.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open image database."));
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openImageDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(IMAGE_STORE_NAME, mode);
    const store = transaction.objectStore(IMAGE_STORE_NAME);
    const request = handler(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB operation failed."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
      database.close();
    };
  });
};

const buildImageRefId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const isIndexedDbImageRef = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.startsWith(IMAGE_REF_PREFIX);

export const storeImageDataUrlInIndexedDb = async (dataUrl: string): Promise<string> => {
  const id = buildImageRefId();
  const record: ImageRecord = {
    id,
    dataUrl,
    updatedAt: Date.now(),
  };
  await withStore("readwrite", (store) => store.put(record));
  return `${IMAGE_REF_PREFIX}${id}`;
};

const getImageFileNameFromDataUrl = (dataUrl: string): string => {
  const mimeMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/.exec(dataUrl);
  const mimeType = mimeMatch?.[1] ?? "image/webp";
  const extension =
    mimeType === "image/jpeg"
      ? "jpg"
      : mimeType === "image/png"
        ? "png"
        : mimeType === "image/gif"
          ? "gif"
          : mimeType === "image/svg+xml"
            ? "svg"
            : mimeType === "image/avif"
              ? "avif"
              : "webp";
  return `builder-image.${extension}`;
};

const dataUrlToFile = async (dataUrl: string, fileName?: string): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("Only image uploads are allowed.");
  }
  return new File([blob], fileName || getImageFileNameFromDataUrl(dataUrl), {
    type: blob.type,
  });
};

export const uploadImageFileForBuilder = async (
  file: File,
  context = "builder",
): Promise<string> => {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("context", context);

  const response = await fetch("/api/admin/images", {
    method: "POST",
    body: formData,
  });
  let payload: AdminImageUploadResponse | null = null;
  try {
    payload = (await response.json()) as AdminImageUploadResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload?.error === "string" && payload.error.trim()
        ? payload.error
        : "Image upload failed. Please try again.";
    throw new Error(message);
  }

  if (typeof payload?.url !== "string" || !payload.url.trim()) {
    throw new Error("Image upload failed. No public URL was returned.");
  }
  return payload.url.trim();
};

export const uploadImageDataUrlForBuilder = async (
  dataUrl: string,
  fileName?: string,
  context = "builder",
): Promise<string> => {
  const file = await dataUrlToFile(dataUrl, fileName);
  return uploadImageFileForBuilder(file, context);
};

export const getImageDataUrlByRef = async (
  value: string | null | undefined,
): Promise<string | null> => {
  if (!isIndexedDbImageRef(value)) {
    return typeof value === "string" ? value : null;
  }

  const id = value.slice(IMAGE_REF_PREFIX.length);
  if (!id) {
    return null;
  }

  try {
    const record = await withStore<ImageRecord | undefined>("readonly", (store) => store.get(id));
    return record?.dataUrl ?? null;
  } catch {
    return null;
  }
};

export const collectIndexedDbImageRefsFromBuilderData = (data: BuilderData): string[] => {
  const refs = new Set<string>();
  const push = (candidate: string | null | undefined) => {
    if (isIndexedDbImageRef(candidate)) {
      refs.add(candidate);
    }
  };

  push(data.header.avatarUrl);
  push(data.header.heroImageUrl);
  push(data.header.shareImageUrl);
  push(data.theme.wallpaperUrl);

  for (const social of data.socials) {
    push(social.iconImageUrl);
    push(social.iconUrl);
    push(social.preOpenModal?.bannerImageUrl);
  }

  for (const link of data.links) {
    push(link.settings.thumbnailUrl);
    push(link.settings.imageUrl);
    push(link.settings.iconImageUrl);
    push(link.settings.backgroundImageUrl);
    push(link.preOpenModal?.bannerImageUrl);
    push(link.discount?.cardThumbnail);
    push(link.discount?.modalHeroImage);
    push(link.embedPost?.cardIcon);
    push(link.embedPost?.cardThumbnail);
    link.promoGallery?.items.forEach((item) => push(item.imageUrl));
  }

  return Array.from(refs);
};

const resolveValueFromMap = (
  value: string | null | undefined,
  resolved: Record<string, string>,
): string | undefined => {
  if (isIndexedDbImageRef(value)) {
    return resolved[value];
  }
  return typeof value === "string" ? value : undefined;
};

const blobUrlToDataUrl = async (value: string): Promise<string | undefined> => {
  if (!value.startsWith("blob:")) {
    return undefined;
  }

  try {
    const response = await fetch(value);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) {
      return undefined;
    }

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Blob image conversion failed."));
      };
      reader.onerror = () => reject(reader.error ?? new Error("Blob image conversion failed."));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
};

const resolveImageValueForPersistence = async (
  value: string | null | undefined,
  fallback?: string,
): Promise<string | undefined> => {
  if (typeof value !== "string") {
    return fallback;
  }

  if (value.startsWith(IMAGE_REF_PREFIX)) {
    const dataUrl = await getImageDataUrlByRef(value);
    if (!dataUrl) {
      throw new Error("Uploaded image is no longer available in this browser. Please upload it again.");
    }
    return uploadImageDataUrlForBuilder(dataUrl);
  }
  if (value.startsWith("blob:")) {
    const dataUrl = await blobUrlToDataUrl(value);
    if (!dataUrl) {
      throw new Error("Uploaded image could not be read. Please upload it again.");
    }
    return uploadImageDataUrlForBuilder(dataUrl);
  }
  if (value.startsWith("data:image/")) {
    return uploadImageDataUrlForBuilder(value);
  }
  return value;
};

export const hydrateBuilderDataWithIndexedDbImages = (
  data: BuilderData,
  resolved: Record<string, string>,
): BuilderData => ({
  ...data,
  header: {
    ...data.header,
    shareImageUrl:
      resolveValueFromMap(data.header.shareImageUrl, resolved) ?? data.header.shareImageUrl,
    avatarUrl: resolveValueFromMap(data.header.avatarUrl, resolved) ?? data.header.avatarUrl,
    heroImageUrl: resolveValueFromMap(data.header.heroImageUrl, resolved) ?? data.header.heroImageUrl,
  },
  theme: {
    ...data.theme,
    wallpaperUrl: resolveValueFromMap(data.theme.wallpaperUrl, resolved) ?? data.theme.wallpaperUrl,
  },
  socials: data.socials.map((social) => ({
    ...social,
    iconImageUrl: resolveValueFromMap(social.iconImageUrl, resolved) ?? social.iconImageUrl,
    iconUrl: resolveValueFromMap(social.iconUrl, resolved) ?? social.iconUrl,
    preOpenModal: social.preOpenModal
      ? {
          ...social.preOpenModal,
          bannerImageUrl:
            resolveValueFromMap(social.preOpenModal.bannerImageUrl, resolved) ??
            social.preOpenModal.bannerImageUrl,
        }
      : social.preOpenModal,
  })),
  links: data.links.map((link) => ({
    ...link,
    settings: {
      ...link.settings,
      thumbnailUrl:
        resolveValueFromMap(link.settings.thumbnailUrl, resolved) ?? link.settings.thumbnailUrl,
      imageUrl: resolveValueFromMap(link.settings.imageUrl, resolved) ?? link.settings.imageUrl,
      iconImageUrl:
        resolveValueFromMap(link.settings.iconImageUrl, resolved) ?? link.settings.iconImageUrl,
      backgroundImageUrl:
        resolveValueFromMap(link.settings.backgroundImageUrl, resolved) ??
        link.settings.backgroundImageUrl,
    },
    preOpenModal: link.preOpenModal
      ? {
          ...link.preOpenModal,
          bannerImageUrl:
            resolveValueFromMap(link.preOpenModal.bannerImageUrl, resolved) ??
            link.preOpenModal.bannerImageUrl,
        }
      : link.preOpenModal,
    discount: link.discount
      ? {
          ...link.discount,
          cardThumbnail:
            resolveValueFromMap(link.discount.cardThumbnail, resolved) ?? link.discount.cardThumbnail,
          modalHeroImage:
            resolveValueFromMap(link.discount.modalHeroImage, resolved) ?? link.discount.modalHeroImage,
        }
      : link.discount,
    embedPost: link.embedPost
      ? {
          ...link.embedPost,
          cardIcon: resolveValueFromMap(link.embedPost.cardIcon, resolved) ?? link.embedPost.cardIcon,
          cardThumbnail:
            resolveValueFromMap(link.embedPost.cardThumbnail, resolved) ?? link.embedPost.cardThumbnail,
        }
      : link.embedPost,
    promoGallery: link.promoGallery
      ? {
          ...link.promoGallery,
          items: link.promoGallery.items.map((item) => ({
            ...item,
            imageUrl: resolveValueFromMap(item.imageUrl, resolved) ?? item.imageUrl,
          })),
        }
      : link.promoGallery,
  })),
});

export const resolveBuilderDataImagesForPersistence = async (
  data: BuilderData,
): Promise<BuilderData> => ({
  ...data,
  header: {
    ...data.header,
    shareImageUrl:
      (await resolveImageValueForPersistence(data.header.shareImageUrl)) ??
      data.header.shareImageUrl,
    avatarUrl:
      (await resolveImageValueForPersistence(data.header.avatarUrl, "/placeholders/avatar-default.svg")) ??
      data.header.avatarUrl,
    heroImageUrl:
      (await resolveImageValueForPersistence(
        data.header.heroImageUrl,
        "/placeholders/wallpaper-default.svg",
      )) ?? data.header.heroImageUrl,
  },
  theme: {
    ...data.theme,
    wallpaperUrl:
      (await resolveImageValueForPersistence(
        data.theme.wallpaperUrl,
        "/placeholders/wallpaper-default.svg",
      )) ?? data.theme.wallpaperUrl,
  },
  socials: await Promise.all(
    data.socials.map(async (social) => ({
      ...social,
      iconImageUrl:
        (await resolveImageValueForPersistence(social.iconImageUrl)) ?? social.iconImageUrl,
      iconUrl: await resolveImageValueForPersistence(social.iconUrl),
      preOpenModal: social.preOpenModal
        ? {
            ...social.preOpenModal,
            bannerImageUrl:
              (await resolveImageValueForPersistence(social.preOpenModal.bannerImageUrl)) ??
              social.preOpenModal.bannerImageUrl,
          }
        : social.preOpenModal,
    })),
  ),
  links: await Promise.all(
    data.links.map(async (link) => ({
      ...link,
      settings: {
        ...link.settings,
        thumbnailUrl:
          (await resolveImageValueForPersistence(link.settings.thumbnailUrl)) ?? undefined,
        imageUrl:
          (await resolveImageValueForPersistence(link.settings.imageUrl)) ?? link.settings.imageUrl,
        iconImageUrl:
          (await resolveImageValueForPersistence(link.settings.iconImageUrl)) ??
          link.settings.iconImageUrl,
        backgroundImageUrl:
          (await resolveImageValueForPersistence(link.settings.backgroundImageUrl)) ??
          link.settings.backgroundImageUrl,
      },
      preOpenModal: link.preOpenModal
        ? {
            ...link.preOpenModal,
            bannerImageUrl:
              (await resolveImageValueForPersistence(link.preOpenModal.bannerImageUrl)) ??
              link.preOpenModal.bannerImageUrl,
          }
        : link.preOpenModal,
      discount: link.discount
        ? {
            ...link.discount,
            cardThumbnail:
              (await resolveImageValueForPersistence(
                link.discount.cardThumbnail,
                "/placeholders/link-thumbnail-default.svg",
              )) ?? link.discount.cardThumbnail,
            modalHeroImage:
              (await resolveImageValueForPersistence(
                link.discount.modalHeroImage,
                "/placeholders/link-thumbnail-default.svg",
              )) ?? link.discount.modalHeroImage,
          }
        : link.discount,
      embedPost: link.embedPost
        ? {
            ...link.embedPost,
            cardIcon:
              (await resolveImageValueForPersistence(link.embedPost.cardIcon, "")) ??
              link.embedPost.cardIcon,
            cardThumbnail:
              (await resolveImageValueForPersistence(
                link.embedPost.cardThumbnail,
                "/placeholders/link-thumbnail-default.svg",
              )) ?? link.embedPost.cardThumbnail,
          }
        : link.embedPost,
      promoGallery: link.promoGallery
        ? {
            ...link.promoGallery,
            items: await Promise.all(
              link.promoGallery.items.map(async (item) => ({
                ...item,
                imageUrl:
                  (await resolveImageValueForPersistence(item.imageUrl)) ?? item.imageUrl,
              })),
            ),
          }
        : link.promoGallery,
    })),
  ),
});
