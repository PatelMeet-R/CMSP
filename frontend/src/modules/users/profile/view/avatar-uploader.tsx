import React from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  ModalDescription,
} from "@/components/custom/model-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCroppedImg } from "@/lib/image-utils";
import { Camera, Trash2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  hasImage: boolean;
  aspect?: number;
}

export function AvatarUploader({
  children,
  onUpload,
  onRemove,
  hasImage,
  aspect = 1,
}: Props) {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState<number>(1);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [open, onOpenChange] = React.useState<boolean>(false);

  const [photo, setPhoto] = React.useState<{ url: string; file: File | null }>({
    url: "",
    file: null,
  });
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    setPhoto({ url: URL.createObjectURL(file), file });
  };

  const handleUpdate = async () => {
    if (photo?.file && croppedAreaPixels) {
      setIsPending(true);
      try {
        const croppedImg = await getCroppedImg(
          photo.url,
          croppedAreaPixels,
          photo.file.name,
          photo.file.type,
        );
        if (!croppedImg || !croppedImg.file)
          throw new Error("Failed to crop image");

        await onUpload(croppedImg.file);

        setPhoto({ url: "", file: null });
        onOpenChange(false);
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    setIsPending(true);
    try {
      await onRemove();
      onOpenChange(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent className="h-max md:max-w-md">
        <ModalHeader>
          <ModalTitle>Profile Picture</ModalTitle>
          <ModalDescription className="sr-only">
            Upload, crop, or remove your profile picture.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {!photo.file ? (
            <div className="flex flex-col gap-3 w-full">
              <Button
                variant="outline"
                className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                onClick={() =>
                  document.getElementById("avatar-upload-input")?.click()
                }
              >
                <Camera className="h-6 w-6 text-muted-foreground" />
                <span className="text-muted-foreground">Select New Photo</span>
              </Button>
              {hasImage && onRemove && (
                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isPending}
                  className="flex gap-2 w-full"
                >
                  <Trash2 className="h-4 w-4" /> Remove Current Photo
                </Button>
              )}
            </div>
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={photo.url}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
                classes={{
                  containerClassName: isPending
                    ? "opacity-50 pointer-events-none"
                    : "",
                }}
              />
            </div>
          )}

          <Input
            id="avatar-upload-input"
            disabled={isPending}
            onChange={handleFileChange}
            type="file"
            accept="image/*"
            className="hidden"
          />
        </ModalBody>

        <ModalFooter className="grid w-full grid-cols-2 gap-2">
          <Button
            className="w-full"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setPhoto({ url: "", file: null });
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="w-full"
            onClick={handleUpdate}
            disabled={!photo.file || isPending}
          >
            {isPending ? "Saving..." : "Save Image"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
