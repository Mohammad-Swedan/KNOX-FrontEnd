import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2, ShoppingCart } from "lucide-react";
import { useEnroll } from "../hooks/useEnrollment";
import { toast } from "sonner";
import type { ProductCourse } from "../types";

interface EnrollButtonProps {
  course: ProductCourse;
  isEnrolled?: boolean;
  onEnrolled?: () => void;
  onContinue?: () => void;
}

export default function EnrollButton({
  course,
  isEnrolled = false,
  onEnrolled,
  onContinue,
}: EnrollButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prepaidCode, setPrepaidCode] = useState("");
  const { enroll, loading, error } = useEnroll();

  if (isEnrolled) {
    return (
      <Button className="w-full cursor-pointer" onClick={onContinue}>
        Continue Learning
      </Button>
    );
  }

  const handleEnroll = async () => {
    try {
      await enroll(course.id, prepaidCode.trim() || undefined);
      setDialogOpen(false);
      toast.success("Successfully enrolled!");
      onEnrolled?.();
    } catch {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  const handleClick = () => {
    if (course.isFree) {
      handleEnroll();
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Button
        className="w-full cursor-pointer"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Enrolling...
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {course.isFree
              ? "Enroll for Free"
              : `Enroll — ${(course.discountedPrice ?? course.price).toFixed(2)} JD`}
          </>
        )}
      </Button>

      {/* Prepaid code dialog for paid courses */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              This is a paid course. Enter your prepaid code below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prepaidCode">Prepaid Code</Label>
              <Input
                id="prepaidCode"
                value={prepaidCode}
                onChange={(e) => setPrepaidCode(e.target.value)}
                placeholder="Enter your prepaid code"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEnroll}
              disabled={loading || !prepaidCode.trim()}
              className="cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
