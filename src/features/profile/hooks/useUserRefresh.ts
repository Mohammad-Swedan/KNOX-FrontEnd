import { useState } from "react";
import { getUserInfo } from "@/features/auth/api";
import { persistSession, readSession } from "@/hooks/authStorage";
import type { User } from "@/app/providers/AuthContext";

export const useUserRefresh = (currentUser: User | null) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchUserInfo = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      console.log("[UserProfile] Fetching user info from /api/Users/me...");

      const userInfo = await getUserInfo();
      console.log("[UserProfile] Fetched user info:", userInfo);

      if (!currentUser) return;

      const updatedUser = {
        ...currentUser,
        identityUserId: userInfo.identityUserId,
        domainUserId: userInfo.domainUserId,
        fullName: userInfo.fullName,
        dateJoined: userInfo.dateJoined,
        role: userInfo.role,
        isActive: userInfo.isActive,
        isVerfied: userInfo.isVerfied,
        verficationDate: userInfo.verficationDate,
        profilePictureUrl: userInfo.profilePictureUrl,
        universityId: userInfo.universityId,
        universityName: userInfo.universityName,
        facultyId: userInfo.facultyId,
        facultyName: userInfo.facultyName,
        majorId: userInfo.majorId,
        majorName: userInfo.majorName,
      };

      const session = readSession();
      if (session) {
        persistSession({
          ...session,
          user: updatedUser,
        });
      }

      window.location.reload();
    } catch (err) {
      console.error("[UserProfile] Failed to fetch user info:", err);
      setError(
        "Failed to load complete user information. Please try refreshing."
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkAndRefetchIfNeeded = async (user: User | null) => {
    if (!user) return;

    const isMissingData =
      !user.universityName ||
      !user.facultyName ||
      !user.majorName ||
      !user.role ||
      !user.fullName;

    if (isMissingData && !isRefreshing) {
      console.log(
        "[UserProfile] Missing user data, refetching from /api/Users/me"
      );
      await refetchUserInfo();
    }
  };

  return {
    isRefreshing,
    error,
    refetchUserInfo,
    checkAndRefetchIfNeeded,
  };
};
