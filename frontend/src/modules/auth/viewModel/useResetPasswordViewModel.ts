import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { toastService } from "@/core/toast/toastService";
import { ResetPassword } from "@/modules/auth/model/authService";
import {
  resetPasswordInputSchema,
  type resetPasswordInput,
} from "@/modules/auth/types/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useResetPasswordViewModel() {
  const navigate = useNavigate();
  const form = useForm<resetPasswordInput>({
    resolver: zodResolver(resetPasswordInputSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const ResetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: resetPasswordInput;
    }) => ResetPassword(token, data),
    onSuccess: (response) => {
      toastService.success(response);
      toastService.success("Password reset successfully");
      navigate("/login");
    },
    onError: (error) => {
      console.log(error);
      toastService.error(getAxiosErrorMessage(error));
    },
  });
  const onSubmit = (payload: { token: string; data: resetPasswordInput }) => {
    ResetPasswordMutation.mutate(payload);
  };
  return { form, onSubmit, isSubmitting: ResetPasswordMutation.isPending };
}
