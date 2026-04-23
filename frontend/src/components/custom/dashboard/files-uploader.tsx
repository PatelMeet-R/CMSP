import * as React from "react";
import { Upload, X, FileText, Archive } from "lucide-react"; // Added Archive icon for ZIPs
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toastService } from "@/core/toast/toastService";

export interface FileUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
  className?: string;
  // Made these customizable for reusability!
  accept?: string;
  description?: string;
}

export const FileUploader = React.forwardRef<HTMLDivElement, FileUploaderProps>(
  (
    {
      file,
      onChange,
      maxSizeMB = 5,
      className,
      accept = ".png,.jpeg,.jpg,.pdf,.docx,.zip", // Added .zip
      description = `Supports PDF, DOCX, JPG, PNG, ZIP (Max ${maxSizeMB}MB)`,
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const previewUrl = React.useMemo(() => {
      if (file && file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    }, [file]);

    React.useEffect(() => {
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl]);

    const handleFileChange = (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;

      const selectedFile = newFiles[0];

      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        toastService.error(`File must be smaller than ${maxSizeMB}MB.`);
        return;
      }

      onChange(selectedFile);
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // Smart Icon Selection based on file extension
    const getFileIcon = () => {
      if (file?.name.endsWith(".zip"))
        return <Archive className="h-8 w-8 text-primary/70" />;
      return <FileText className="h-8 w-8 text-primary/70" />;
    };

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group bg-background",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/10",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileChange(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-200">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    Click or drag file to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-4 border rounded-xl bg-card shadow-sm flex items-center gap-4"
            >
              <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  getFileIcon()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                onClick={handleRemoveFile}
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
FileUploader.displayName = "FileUploader";
