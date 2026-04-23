import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { toastService } from "@/core/toast/toastService";
import { sendVerificationEmail } from "@/modules/auth/model/authService";
import { useMutation } from "@tanstack/react-query";

export const useRequestVarification = () => {
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: sendVerificationEmail,
    onSuccess: (response) => {
      toastService.success(
        response?.message || "Verification link sent to your email!",
      );
    },
    onError: (error) => {
      toastService.error(getAxiosErrorMessage(error));
    },
  });
  return {
    mutate,
    isPending,
    isSuccess,
  };
};
