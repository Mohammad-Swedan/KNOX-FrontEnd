import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register } from "@/features/auth/api";
import { useAuth } from "@/app/providers/useAuth";

type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  majorId: number;
};

export const useRegistration = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegistration = async (data: RegistrationData) => {
    try {
      const result = await register(data);

      // Backend requires email verification
      if (result.requiresVerification) {
        toast.info("Verify your email", {
          description:
            result.message ||
            "A 6-digit OTP has been sent to your email. Please verify your account.",
          duration: 5000,
        });
        navigate(
          `/auth/verify-account?email=${encodeURIComponent(data.email)}`,
        );
        return;
      }

      // No verification required — attempt auto-login
      try {
        await login(data.email, data.password);
        toast.success("Welcome to Uni-Hub!", {
          description: "Your account has been created successfully.",
          duration: 3000,
        });
        setTimeout(() => navigate("/"), 1500);
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        toast.info("Registration successful", {
          description: "Please log in with your credentials.",
          duration: 4000,
        });
        setTimeout(() => navigate("/auth/login"), 1500);
      }
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      let errorMessage = "Registration failed. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; errors?: { description: string }[] };
          };
        };
        const errors = axiosError.response?.data?.errors;
        if (errors && errors.length > 0) {
          errorMessage = errors.map((e) => e.description).join(" ");
        } else {
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error("Registration failed", { description: errorMessage });
      throw error;
    }
  };

  return { handleRegistration };
};
