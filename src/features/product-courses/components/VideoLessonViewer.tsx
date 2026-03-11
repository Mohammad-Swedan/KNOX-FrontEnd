import {
  AlertCircle,
  RefreshCw,
  Upload,
  Clock,
  Loader2,
  Film,
  XOctagon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { VideoStatus, VideoStatusMessage } from "../types";
import type { LessonVideoContent } from "../types";

interface VideoLessonViewerProps {
  video: LessonVideoContent;
  onRefresh?: () => void;
}

const isBunnyEmbed = (url: string) =>
  url.includes("iframe.mediadelivery.net") || url.includes("/embed/");

export default function VideoLessonViewer({
  video,
  onRefresh,
}: VideoLessonViewerProps) {
  // Show the player whenever a playbackUrl is available
  if (video.playbackUrl) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-xl">
        {isBunnyEmbed(video.playbackUrl) ? (
          <iframe
            src={video.playbackUrl}
            title="Lesson video"
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={video.playbackUrl}
            controls
            playsInline
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>
    );
  }

  // No playbackUrl — show video processing status
  const statusConfig: Record<
    string,
    { icon: React.ReactNode; color: string; bgColor: string }
  > = {
    [VideoStatus.Uploading]: {
      icon: <Upload className="h-8 w-8" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    [VideoStatus.Queued]: {
      icon: <Clock className="h-8 w-8" />,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    [VideoStatus.Processing]: {
      icon: <Loader2 className="h-8 w-8 animate-spin" />,
      color: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
    },
    [VideoStatus.Encoding]: {
      icon: <Film className="h-8 w-8" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    [VideoStatus.Failed]: {
      icon: <XOctagon className="h-8 w-8" />,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  };

  const config = statusConfig[video.videoStatus] ?? {
    icon: <AlertCircle className="h-8 w-8" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
  };

  const message = VideoStatusMessage[video.videoStatus] ?? "Unknown status";
  const isFailed = video.videoStatus === VideoStatus.Failed;

  return (
    <Card className="border-0 shadow-lg">
      <CardContent
        className={`flex flex-col items-center justify-center py-14 gap-5 ${config.bgColor} rounded-xl`}
      >
        <div className={config.color}>{config.icon}</div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold">{message}</p>
          <p className="text-sm text-muted-foreground">
            {isFailed
              ? "This video could not be processed. Please contact the instructor."
              : "Please check back shortly. The video is being prepared."}
          </p>
        </div>
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
