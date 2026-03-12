import { useAuth } from "@/app/providers/useAuth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useUserRefresh } from "../hooks/useUserRefresh";
import { ErrorBanner } from "./ErrorBanner";
import { LoadingBanner } from "./LoadingBanner";
import { ProfileHeader } from "./ProfileHeader";
import { AcademicInfoCard } from "./AcademicInfoCard";
import { AccountDetailsCard } from "./AccountDetailsCard";
import { ImageCropper } from "./ImageCropper";
import { uploadProfilePicture, deleteProfilePicture } from "../api";
import { toast } from "sonner";

export const UserProfile = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { isRefreshing, error, refetchUserInfo, checkAndRefetchIfNeeded } =
    useUserRefresh(user);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  useEffect(() => {
    checkAndRefetchIfNeeded(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setIsUploadingImage(true);
      const file = new File([croppedBlob], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      await uploadProfilePicture(file);
      await refetchUserInfo();
      toast.success(t("profile.messages.pictureUpdated"));
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
      toast.error(t("profile.messages.pictureUpdateFailed"));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      setIsDeletingImage(true);
      await deleteProfilePicture();
      await refetchUserInfo();
      toast.success(t("profile.messages.pictureRemoved"));
    } catch (err) {
      console.error("Failed to delete profile picture:", err);
      toast.error(t("profile.messages.pictureRemoveFailed"));
    } finally {
      setIsDeletingImage(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-5xl">
      {/* Verification Alert Banner */}
      {user.isVerfied === false && (
        <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800/60 bg-linear-to-r from-red-50 via-red-50 to-orange-50 dark:from-red-950/40 dark:via-red-950/30 dark:to-orange-950/20 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5">
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/40 shrink-0">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-red-800 dark:text-red-300">
                {t("profile.verification.title", {
                  defaultValue: "Your account is not verified",
                })}
              </h3>
              <p className="text-xs sm:text-sm text-red-600/80 dark:text-red-400/70 mt-0.5">
                {t("profile.verification.description", {
                  defaultValue:
                    "Verify your email to unlock all features and secure your account.",
                })}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0 gap-1.5"
              asChild
            >
              <Link
                to={`/auth/verify-account?email=${encodeURIComponent(user.email)}`}
              >
                <ShieldCheck className="h-4 w-4" />
                {t("profile.verification.action", {
                  defaultValue: "Verify Now",
                })}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Status Banners */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={refetchUserInfo}
          isRefreshing={isRefreshing}
        />
      )}
      {(isRefreshing || isUploadingImage || isDeletingImage) && !error && (
        <LoadingBanner />
      )}

      {/* Profile Header */}
      <ProfileHeader
        user={user}
        onLogout={logout}
        onEditPhoto={() => setIsImageCropperOpen(true)}
        onDeletePhoto={handleDeleteProfilePicture}
        isDeletingPhoto={isDeletingImage}
      />

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <AcademicInfoCard user={user} />
        <AccountDetailsCard user={user} />
      </div>

      {/* Image Cropper Dialog */}
      <ImageCropper
        open={isImageCropperOpen}
        onOpenChange={setIsImageCropperOpen}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
