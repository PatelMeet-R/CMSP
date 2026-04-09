import { ROUTENAME } from "@/core/Constants/RouteName";
import { getAxiosErrorMessage } from "@/core/helper/errorMessage";
import { toastService } from "@/core/toast/toastService";
import { verifyEmailToken } from "@/modules/auth/model/authService";
import { logout } from "@/store/features/auth.slice";
import { useAppDispatch } from "@/store/hook";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useProcessVerification = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: verifyEmailToken,
    onSuccess: () => {
      toastService.success("Email successfully verified!");
      dispatch(logout());
      setTimeout(() => navigate(ROUTENAME.LOGIN), 3000);
    },
    onError: (error) => {
      toastService.error(
        getAxiosErrorMessage(error) || "Link expired or invalid.",
      );

      navigate(ROUTENAME.LOGIN);
    },
  });
  return { mutate, isPending, isSuccess, isError, error };
};
