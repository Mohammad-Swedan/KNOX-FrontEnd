import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Calendar,
  Shield,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "@/app/providers/AuthContext";
import { formatDate, getRoleBadgeVariant } from "../utils/profileUtils";

interface AccountDetailsCardProps {
  user: User;
}

export const AccountDetailsCard = ({ user }: AccountDetailsCardProps) => {
  return (
    <Card className="relative overflow-hidden border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-secondary to-primary" />

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary/10 dark:bg-secondary/15">
            <Clock className="h-5 w-5 text-secondary dark:text-secondary-foreground" />
          </div>
          Account Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.dateJoined && (
          <div className="group flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                Member Since
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {formatDate(user.dateJoined)}
              </p>
            </div>
          </div>
        )}
        {user.role && (
          <div className="group flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Role
              </p>
              <Badge
                variant="outline"
                className={`${getRoleBadgeVariant(user.role)} text-xs`}
              >
                {user.role === "User" ? "Student" : user.role}
              </Badge>
            </div>
          </div>
        )}
        {user.isActive !== undefined && (
          <div className="group flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Account Status
              </p>
              <Badge
                variant="outline"
                className={`text-xs ${
                  user.isActive
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        )}
        {user.isVerfied !== undefined && (
          <div className="group flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Verification Status
              </p>
              {user.isVerfied ? (
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/10 text-primary dark:text-primary border-primary/20 dark:border-primary/30"
                >
                  Verified
                </Badge>
              ) : (
                <div className="flex flex-col gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 w-fit"
                  >
                    <ShieldAlert className="h-3 w-3 me-1" />
                    Not Verified
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs w-fit border-primary/50 text-primary hover:bg-primary/10"
                    asChild
                  >
                    <Link
                      to={`/auth/verify-account?email=${encodeURIComponent(user.email)}`}
                    >
                      <ShieldCheck className="h-3 w-3 me-1.5" />
                      Verify Now
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="group flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
            <KeyRound className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs w-fit"
              asChild
            >
              <Link to="/profile/change-password">Change Password</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
