export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  majorId: number;
}

export interface RegisterUserInfo {
  domainUserId: number;
  identityUserId: number;
  email: string;
  assignedRole: string;
}

export interface RegisterResponse {
  user?: RegisterUserInfo;
  requiresVerification?: boolean;
  message?: string;
  otpSent?: boolean;
  // Tokens returned when no verification is required
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface UserInfoResponse {
  identityUserId: number;
  domainUserId: number;
  email: string;
  fullName: string;
  dateJoined: string;
  role: string;
  isActive: boolean;
  isVerfied: boolean;
  verficationDate: string;
  profilePictureUrl: string | null;
  universityId: number;
  universityName: string;
  facultyId: number;
  facultyName: string;
  majorId: number;
  majorName: string;
}

// ─── Account Verification ────────────────────────────────────────────────────

export interface SendVerificationOtpRequest {
  email: string;
}

export interface VerifyAccountRequest {
  email: string;
  otp: string;
}

export interface VerifyAccountResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface CheckVerificationStatusResponse {
  email: string;
  isVerified: boolean;
}

// ─── Forgot Password ─────────────────────────────────────────────────────────

export interface ForgotPasswordSendOtpRequest {
  email: string;
}

export interface ForgotPasswordVerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// ─── Change Password (Authenticated) ─────────────────────────────────────────

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
