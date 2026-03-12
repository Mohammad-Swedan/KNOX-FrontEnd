import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { register } from "@/features/auth/api";

type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  majorId: number;
};

export const useRegistration = () => {
  const navigate = useNavigate();

  const handleRegistration = async (data: RegistrationData) => {
    try {
      const result = await register(data);

      // Always redirect to verify-account page after registration
      toast.info("Verify your email", {
        description:
          result.message ||
          "A 6-digit OTP has been sent to your email. Please verify your account.",
        duration: 5000,
      });
      navigate(`/auth/verify-account?email=${encodeURIComponent(data.email)}`, {
        replace: true,
      });
      return;
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
