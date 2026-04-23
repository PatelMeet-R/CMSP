import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { toastService } from "@/core/toast/toastService";
import { ForgetPassword } from "@/modules/auth/model/authService";
import {
  ForgetPasswordInputSchema,
  type ForgetPasswordInput,
} from "@/modules/auth/types/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useForgotPasswordViewModel() {
  const navigate = useNavigate();
  const form = useForm<ForgetPasswordInput>({
    resolver: zodResolver(ForgetPasswordInputSchema),
    defaultValues: {
      email: "",
    },
  });
  const ForgetPasswordMutation = useMutation({
    mutationFn: ForgetPassword,
    onSuccess: () => {
      toastService.success(
        "If an account with this email exists, we will send you a reset link",
      );
      navigate("/login");
    },
    onError: (error) => {
      console.log(error);
      toastService.error(getAxiosErrorMessage(error));
    },
  });
  const onSubmit = (data: ForgetPasswordInput) => {
    ForgetPasswordMutation.mutate(data);
  };
  return { form, onSubmit, isSubmitting: ForgetPasswordMutation.isPending };
}
