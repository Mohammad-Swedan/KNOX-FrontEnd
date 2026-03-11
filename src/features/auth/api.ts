import { apiClient } from "@/lib/api/apiClient";
import type {
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  UserInfoResponse,
  SendVerificationOtpRequest,
  VerifyAccountRequest,
  VerifyAccountResponse,
  CheckVerificationStatusResponse,
  ForgotPasswordSendOtpRequest,
  ForgotPasswordVerifyOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "@/features/auth/types";
import { clearSession } from "@/hooks/authStorage";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function refreshToken(
  data: RefreshRequest,
): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>("/auth/refresh", data);
  return response.data;
}

export async function logout(refreshToken?: string): Promise<void> {
  try {
    if (refreshToken) {
      await apiClient.post("/auth/logout", { refreshToken });
    } else {
      await apiClient.post("/auth/logout");
    }
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    clearSession();
  }
}

export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>(
    "/auth/register",
    data,
  );
  return response.data;
}

export async function getUserInfo(): Promise<UserInfoResponse> {
  const response = await apiClient.get<UserInfoResponse>("/Users/me");
  return response.data;
}

// ─── Account Verification ────────────────────────────────────────────────────

export async function sendVerificationOtp(
  data: SendVerificationOtpRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/auth/send-verification-otp",
    data,
  );
  return response.data;
}

export async function verifyAccount(
  data: VerifyAccountRequest,
): Promise<VerifyAccountResponse> {
  const response = await apiClient.post<VerifyAccountResponse>(
    "/auth/verify-account",
    data,
  );
  return response.data;
}

export async function checkVerificationStatus(
  email: string,
): Promise<CheckVerificationStatusResponse> {
  const response = await apiClient.get<CheckVerificationStatusResponse>(
    `/auth/verification-status?email=${encodeURIComponent(email)}`,
  );
  return response.data;
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export async function forgotPasswordSendOtp(
  data: ForgotPasswordSendOtpRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/auth/forgot-password/send-otp",
    data,
  );
  return response.data;
}

export async function forgotPasswordVerifyOtp(
  data: ForgotPasswordVerifyOtpRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/auth/forgot-password/verify-otp",
    data,
  );
  return response.data;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/auth/reset-password",
    data,
  );
  return response.data;
}

// ─── Change Password (Authenticated) ─────────────────────────────────────────

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    "/auth/change-password",
    data,
  );
  return response.data;
}
