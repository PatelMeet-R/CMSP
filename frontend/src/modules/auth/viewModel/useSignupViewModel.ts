import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  SignupInputSchema,
  type SignupInput,
} from "@/modules/auth/types/auth.schemas";
import { registerUser } from "@/modules/auth/model/authService";
import { useBranchViewModel } from "@/modules/branch/viewModel/useBranchViewModel";
import { toastService } from "@/core/toast/toastService";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";

export function useSignupViewModel() {
  const navigate = useNavigate();

  const form = useForm<SignupInput>({
    resolver: zodResolver(SignupInputSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      enrollmentNumber: "",
      password: "",
      branchId: 0,
    },
  });

  const { branches, isLoading: isLoadingBranches } = useBranchViewModel();

  const signupMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      toastService.success(response.message);
      navigate("/");
    },
    onError: (error) => {
      toastService.error(getAxiosErrorMessage(error));
    },
  });

  const onSubmit = (data: SignupInput) => {
    signupMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    branches,
    isLoadingBranches,
    isSubmitting: signupMutation.isPending,
  };
}
