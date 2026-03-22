import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import {
  SignupInputSchema,
  type SignupInput,
} from "@/modules/auth/types/signupSchema";
import { registerUser } from "@/modules/auth/model/authService";

export function useSignupViewModel() {
  const navigate = useNavigate();

  // State to hold the branches for the dropdown
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  const form = useForm<SignupInput>({
    resolver: zodResolver(SignupInputSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      enrollmentNumber: "",
      password: "",
    },
  });

  // Fetch branches as soon as the component mounts
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches();
        setBranches(data);
      } catch (error) {
        console.error("Failed to load branches", error);
      } finally {
        setIsLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  const onSubmit = async (data: SignupInput) => {
    try {
      await registerUser(data);
      console.log("Signup successful!");
      navigate("/");
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return {
    form,
    onSubmit,
    branches,
    isLoadingBranches,
  };
}
