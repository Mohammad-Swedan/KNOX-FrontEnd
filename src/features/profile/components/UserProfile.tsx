import { useAuth } from "@/app/providers/useAuth";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
