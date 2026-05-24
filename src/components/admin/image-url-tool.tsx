"use client";

import { Check, Copy, Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { ChangeEvent, useEffect, useId, useRef, useState } from "react";

import { SafeImage } from "@/components/shared/safe-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageFileForBuilder } from "@/lib/local-storage/image-storage";

type ImageUrlToolProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SUPPORTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/webp";

const getUploadErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim()
    ? error.message
    : "Image upload failed. Please try again.";

export const ImageUrlTool = ({ open, onOpenChange }: ImageUrlToolProps) => {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(
    () => () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
        previewObjectUrlRef.current = null;
      }
    },
    [],
  );

  if (!open) {
    return null;
  }

  const setSelectedPreviewFile = (file: File | null) => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = nextPreviewUrl;
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCopied(false);
    setPublicUrl("");
    setStatusMessage(null);
    setErrorMessage(null);

    if (!file) {
      setSelectedPreviewFile(null);
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setSelectedPreviewFile(null);
      setErrorMessage("Please choose a PNG, JPG, JPEG, or WebP image.");
      event.target.value = "";
      return;
    }

    setSelectedPreviewFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    setIsUploading(true);
    setCopied(false);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const uploadedUrl = await uploadImageFileForBuilder(selectedFile, "image-url-tool");
      setPublicUrl(uploadedUrl);
      setStatusMessage("Upload complete. Public URL is ready to copy.");
    } catch (error) {
      setErrorMessage(getUploadErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      urlInputRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const clearSelectedImage = () => {
    setSelectedPreviewFile(null);
    setPublicUrl("");
    setStatusMessage(null);
    setErrorMessage(null);
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-url-tool-title"
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-2xl sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              First-party upload
            </p>
            <h2 id="image-url-tool-title" className="mt-1 text-xl font-semibold">
              Image URL Tool
            </h2>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close Image URL Tool"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-3">
          {previewUrl || publicUrl ? (
            <SafeImage
              src={publicUrl || previewUrl || ""}
              alt="Selected upload preview"
              className="h-56 w-full rounded-lg border border-border/70 bg-background object-contain"
              width={640}
              height={360}
              unoptimized
            />
          ) : (
            <button
              type="button"
              className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/80 bg-background/70 text-sm text-muted-foreground transition hover:bg-muted/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="size-8" />
              <span>Choose a PNG, JPG, JPEG, or WebP image</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <ImageIcon className="size-4" />
              {selectedFile ? "Change image" : "Select image"}
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {isUploading ? "Uploading..." : "Upload image"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearSelectedImage}
              disabled={(!selectedFile && !publicUrl) || isUploading}
            >
              Clear
            </Button>
          </div>
          {selectedFile ? (
            <p className="mt-2 break-all text-xs text-muted-foreground">
              {selectedFile.name}
            </p>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium" htmlFor={`${fileInputId}-url`}>
            Public image URL
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              ref={urlInputRef}
              id={`${fileInputId}-url`}
              value={publicUrl}
              readOnly
              placeholder="Upload an image to generate a public URL"
              className="h-10"
            />
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleCopy}
              disabled={!publicUrl}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy URL"}
            </Button>
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {statusMessage}
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
};
