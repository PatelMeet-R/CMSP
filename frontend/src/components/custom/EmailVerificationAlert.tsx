import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SpinnerCustom } from "@/components/ui/spinner";
import { useRequestVarification } from "@/modules/profile/viewModel/useRequestVarification";

interface EmailVerificationAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailVerificationAlert = ({
  isOpen,
  onClose,
}: EmailVerificationAlertProps) => {
  const { mutate, isPending } = useRequestVarification();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Email Verification Required</AlertDialogTitle>
          <AlertDialogDescription>
            To protect your account, you need to verify your email address
            before you can update your personal profile information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isPending}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutate();
            }}
            disabled={isPending}
          >
            {isPending && <SpinnerCustom />}
            {isPending ? "Sending Link..." : "Send Verification Link"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
