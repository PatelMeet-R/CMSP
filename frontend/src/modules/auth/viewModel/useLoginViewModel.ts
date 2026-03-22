import { loginUser } from "@/modules/auth/model/authService";
import {
  LoginInputSchema,
  type LoginInput,
} from "@/modules/auth/types/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export function useLoginViewModel() {
  const navigate = useNavigate();
  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginUser(data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return {
    form,
    onSubmit,
  };
}
