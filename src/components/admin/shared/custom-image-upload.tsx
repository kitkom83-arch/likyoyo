"use client";

import { SafeImage } from "@/components/shared/safe-image";
import { ChangeEvent, useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ImagePersistencePreset,
  processImageForLocalPersistence,
} from "@/lib/media/file-data-url";
import {
  getImageDataUrlByRef,
  isIndexedDbImageRef,
  storeImageDataUrlInIndexedDb,
  uploadImageDataUrlForBuilder,
} from "@/lib/local-storage/image-storage";
import { cn } from "@/lib/utils";

type CustomImageUploadProps = {
  value?: string | null;
  preset: ImagePersistencePreset;
  onValueChange: (nextValue: string) => void;
  onError?: (message: string | null) => void;
  uploadLabel?: string;
  changeLabel?: string;
  removeLabel?: string;
  emptyHint?: string;
  className?: string;
};

const UPLOAD_ICON_SRC = "/file.svg";

const normalizeImageSrc = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized || null;
};

const getDisplayFileName = (value: string | null, selectedName: string): string => {
  if (selectedName) {
    return selectedName;
  }
  if (!value) {
    return "";
  }
  if (value.startsWith("data:image/")) {
    const mime = value.slice(5, value.indexOf(";"));
    return `Uploaded image (${mime || "data"})`;
  }
  try {
    const parsed = new URL(value);
    const fromPath = parsed.pathname.split("/").pop();
    return fromPath || "Selected image";
  } catch {
    const fromPath = value.split("/").pop();
    return fromPath || "Selected image";
  }
};

export const CustomImageUpload = ({
  value,
  preset,
  onValueChange,
  onError,
  uploadLabel = "Upload image",
  changeLabel = "Change image",
  removeLabel = "Remove image",
  emptyHint = "PNG, JPG, or WebP",
  className,
}: CustomImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resolvedImageValue, setResolvedImageValue] = useState<string | null>(null);
  const inputId = useId();

  const normalizedValue = useMemo(() => normalizeImageSrc(value), [value]);
  const previewSrc = resolvedImageValue ?? normalizedValue;
  const displayName = useMemo(
    () => getDisplayFileName(normalizedValue, selectedFileName),
    [normalizedValue, selectedFileName],
  );

  useEffect(() => {
    let canceled = false;

    const setResolvedImageValueAsync = (nextValue: string | null) => {
      queueMicrotask(() => {
        if (!canceled) {
          setResolvedImageValue(nextValue);
        }
      });
    };

    if (!normalizedValue) {
      setResolvedImageValueAsync(null);
      return () => {
        canceled = true;
      };
    }

    if (!isIndexedDbImageRef(normalizedValue)) {
      setResolvedImageValueAsync(normalizedValue);
      return () => {
        canceled = true;
      };
    }

    void getImageDataUrlByRef(normalizedValue).then((resolved) => {
      if (canceled) {
        return;
      }
      setResolvedImageValue(resolved ?? null);
    });

    return () => {
      canceled = true;
    };
  }, [normalizedValue]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    const previousValue = normalizedValue ?? "";
    try {
      const processed = await processImageForLocalPersistence(file, preset);
      const persistedRef = await storeImageDataUrlInIndexedDb(processed.dataUrl);
      onValueChange(persistedRef);
      setSelectedFileName(file.name);
      const publicUrl = await uploadImageDataUrlForBuilder(processed.dataUrl, file.name, preset);
      onValueChange(publicUrl);
      onError?.(null);
    } catch (error) {
      onValueChange(previousValue);
      onError?.(
        error instanceof Error && error.message.trim()
          ? error.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await handleUpload(file);
    event.target.value = "";
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-3">
        {previewSrc ? (
          <SafeImage
            src={previewSrc}
            alt=""
            className="h-24 w-full max-w-full rounded-md border border-border/60 object-cover"
            width={640}
            height={192}
            unoptimized
          />
        ) : (
          <div className="flex h-24 w-full max-w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border/70 bg-background/60">
            <SafeImage
              src={UPLOAD_ICON_SRC}
              alt=""
              className="h-8 w-8 object-contain opacity-80"
              width={32}
              height={32}
              unoptimized
            />
          </div>
        )}
        <p className="mt-2 break-all text-xs leading-relaxed text-muted-foreground">
          {displayName || emptyHint}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="min-h-10"
            onClick={openFilePicker}
            disabled={isProcessing}
          >
            {isProcessing ? "Uploading..." : normalizedValue ? changeLabel : uploadLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-10"
            onClick={() => {
              onValueChange("");
              setSelectedFileName("");
              onError?.(null);
            }}
            disabled={!normalizedValue || isProcessing}
          >
            {removeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

