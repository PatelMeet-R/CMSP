import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { toastService } from "@/core/toast/toastService";
import { loginUser } from "@/modules/auth/model/authService";
import {
  LoginInputSchema,
  type LoginInput,
} from "@/modules/auth/types/auth.schemas";
import { setCredentials } from "@/store/features/auth.slice";
import { useAppDispatch } from "@/store/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useLoginViewModel() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // V2: response.data is the User object directly (no tokens in body)
      dispatch(setCredentials(response.data));
      toastService.success("Welcome!");
      navigate("/dashboard");
    },
    onError: (error) => {
      console.log(error);
      toastService.error(getAxiosErrorMessage(error));
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isSubmitting: loginMutation.isPending,
  };
}
