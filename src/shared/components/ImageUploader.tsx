import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Button } from "@ui/button";
import { Upload, X, UserPlus } from "lucide-react";

export interface ImageUploadRequest {
  image: File;
  currentImageUrl?: string;
}

export interface ImageUploadResponse {
  message: string;
  imageUrl: string;
}

interface ImageUploaderProps {
  uploadFn: (params: { image: File; currentImageUrl?: string }) => void;
  imageURL?: string;
  fallbackText: string;
  isUploading?: boolean;

  buttonText: string;
}

const ImageUploader = ({
  uploadFn,
  imageURL,
  fallbackText,
  isUploading = false,
  buttonText,
}: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  // Handle drop events
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) setImage(file);
  };

  // Handle file input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) setImage(file);
  };

  // Handle image upload
  const handleUpload = () => {
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }

    uploadFn({ image, currentImageUrl: imageURL });
  };

  // Handle image removal
  const handleRemove = () => {
    setImage(null);
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-96 h-96 flex flex-col items-center justify-center gap-12 p-6">
      <div
        className={`relative w-64 h-64 rounded-full overflow-hidden ${
          dragActive
            ? "before:absolute before:inset-0 before:rounded-full before:border-4 before:border-primary before:animate-pulse before:z-10"
            : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {!image && (!imageURL || imageURL === "null") && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-full p-6 text-center">
            <UserPlus className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Drag image here or click to upload
            </p>
          </div>
        )}

        {!image && imageURL && imageURL !== "null" && (
          <img
            src={imageURL}
            alt={fallbackText}
            className="w-full h-full object-cover"
          />
        )}

        {image && (
          <div className="relative w-full h-full">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!image && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-primary/0 hover:bg-primary/80 transition-colors group cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p>Click to upload</p>
            </div>
          </div>
        )}

        {image && (
          <div
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </div>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={!image || isUploading}
        className="w-full"
      >
        {isUploading ? "Updating..." : `Update ${buttonText}`}
      </Button>
    </div>
  );
};

export default ImageUploader;
