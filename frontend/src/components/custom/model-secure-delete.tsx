import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SecureDeleteModalProps {
  isOpen: boolean;
  targetName: string;
  isDeleting: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export function SecureDeleteModal({
  isOpen,
  targetName,
  isDeleting,

  onCancel,
  onConfirm,
}: SecureDeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleCancel = () => {
    setConfirmText(""); // Reset text on cancel
    onCancel();
  };

  const handleConfirm = () => {
    setConfirmText(""); // Reset text on success
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border shadow-xl rounded-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b bg-red-500/10">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Are you absolutely sure?
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            This action cannot be undone. This will permanently delete
            <span className="font-bold">{targetName}</span> and remove all
            associated files.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Please type{" "}
              <span className="font-bold select-all text-foreground">
                {targetName}
              </span>{" "}
              to confirm.
            </label>
            <Input
              autoFocus
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border-red-200 focus-visible:ring-red-500"
            />
          </div>
        </div>

        <div className="p-4 border-t bg-muted/30 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== targetName || isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? "Deleting..." : "I understand, delete this"}
          </Button>
        </div>
      </div>
    </div>
  );
}
